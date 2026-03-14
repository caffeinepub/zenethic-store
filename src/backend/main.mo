import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  // Components
  include MixinStorage();

  // Authorization state kept for upgrade compatibility (not actively used)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // UserProfile kept for upgrade compatibility
  public type UserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Categories kept for upgrade compatibility
  let categories = Map.empty<Text, Bool>();

  // Data types
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    imageUrl : Text;
    stockQuantity : Nat;
    isActive : Bool;
    createdAt : Int;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    priceAtPurchase : Nat;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
    shippingAddress : Text;
  };

  public type StoreStats = {
    totalOrders : Nat;
    totalRevenue : Nat;
    productCount : Nat;
    activeProductCount : Nat;
  };

  // Persistent storage
  var nextProductId = 1;
  var nextOrderId = 1;

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Nat, Order>();

  // Stripe integration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Product Management — no auth required (single-owner store, PIN-gated on frontend)
  public shared func createProduct(product : Product) : async () {
    let newProduct = {
      product with
      id = nextProductId;
      createdAt = Time.now();
    };
    products.add(nextProductId, newProduct);
    nextProductId += 1;
  };

  public shared func updateProduct(product : Product) : async () {
    switch (products.get(product.id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.add(product.id, product);
      };
    };
  };

  public shared func deleteProduct(productId : Nat) : async () {
    products.remove(productId);
  };

  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getCategories() : async [Text] {
    let cats = Map.empty<Text, Bool>();
    for (p in products.values()) {
      cats.add(p.category, true);
    };
    cats.keys().toArray();
  };

  // Cart Management
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (not product.isActive) { Runtime.trap("Product is not active") };
        let currentCart = switch (carts.get(caller)) {
          case (null) { [] };
          case (?cart) { cart };
        };
        carts.add(caller, currentCart.concat([{ productId; quantity }]));
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
    carts.add(caller, currentCart.filter(func(item) { item.productId != productId }));
  };

  public shared ({ caller }) func updateCartQuantity(productId : Nat, quantity : Nat) : async () {
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
    carts.add(caller, currentCart.map(func(item) {
      if (item.productId == productId) { { productId; quantity } } else { item };
    }));
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    carts.remove(caller);
  };

  // Order Management
  public shared ({ caller }) func placeOrder(shippingAddress : Text) : async () {
    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };
    if (cart.size() == 0) { Runtime.trap("Cart is empty") };
    let orderItems = cart.map(func(item) {
      let price = switch (products.get(item.productId)) {
        case (null) { 0 };
        case (?product) { product.price };
      };
      { productId = item.productId; quantity = item.quantity; priceAtPurchase = price };
    });
    let totalAmount = orderItems.foldLeft(0, func(acc, item) {
      acc + (item.quantity * item.priceAtPurchase);
    });
    orders.add(nextOrderId, {
      id = nextOrderId;
      userId = caller;
      items = orderItems;
      totalAmount;
      status = "pending";
      createdAt = Time.now();
      shippingAddress;
    });
    carts.remove(caller);
    nextOrderId += 1;
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    orders.values().toArray().filter(func(order) { order.userId == caller });
  };

  public query func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public shared func updateOrderStatus(orderId : Nat, status : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(orderId, { order with status });
      };
    };
  };

  public query func getStoreStats() : async StoreStats {
    let totalOrders = orders.size();
    let totalRevenue = orders.values().toArray().foldLeft(0, func(acc, order) {
      acc + order.totalAmount;
    });
    let productCount = products.size();
    var activeProductCount = 0;
    for (product in products.values()) {
      if (product.isActive) { activeProductCount += 1 };
    };
    { totalOrders; totalRevenue; productCount; activeProductCount };
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  module CartItem {
    public func compare(c1 : CartItem, c2 : CartItem) : Order.Order {
      Nat.compare(c1.productId, c2.productId);
    };
  };

  module OrderItem {
    public func compare(o1 : OrderItem, o2 : OrderItem) : Order.Order {
      switch (Nat.compare(o1.productId, o2.productId)) {
        case (#equal) { Nat.compare(o1.quantity, o2.quantity) };
        case (order) { order };
      };
    };
  };

  module StoreStats {
    public func compare(s1 : StoreStats, s2 : StoreStats) : Order.Order {
      switch (Nat.compare(s1.totalOrders, s2.totalOrders)) {
        case (#equal) { Nat.compare(s1.totalRevenue, s2.totalRevenue) };
        case (order) { order };
      };
    };
  };
};
