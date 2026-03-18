import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Order "mo:core/Order";



actor {
  // Components
  include MixinStorage();

  // Persistent state
  stable var nextProductId = 1;
  stable var nextOrderId = 1;
  stable var upiId : Text = "";
  stable var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  stable let products = Map.empty<Nat, Product>();
  stable let carts = Map.empty<Principal, [CartItem]>();
  stable let orders = Map.empty<Nat, Order>();

  // User profiles
  public type UserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, UserProfile>();
  let categories = Map.empty<Text, Bool>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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
    paymentMethod : Text;
    customerName : Text;
    customerPhone : Text;
  };

  public type StoreStats = {
    totalOrders : Nat;
    totalRevenue : Nat;
    productCount : Nat;
    activeProductCount : Nat;
  };

  // --- UPI (Admin-only) ---
  public shared ({ caller }) func setUpiId(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set UPI ID");
    };
    upiId := id;
  };

  public query func getUpiId() : async Text {
    upiId;
  };

  // --- Stripe (Admin-only configuration) ---
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?value) { value };
    };
  };

  // --- Stripe session status (User-only) ---
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // --- Stripe checkout session (User-only) ---
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // --- HTTP outcalls ---
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // --- Product Management (No auth check on these endpoints as per requirements) ---
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
      case (?_) { products.add(product.id, product) };
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
    for (p in products.values()) { cats.add(p.category, true) };
    cats.keys().toArray();
  };

  // --- Cart Management (User-only) ---
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (not product.isActive) { Runtime.trap("Product not active") };
        let cart = switch (carts.get(caller)) { case (null) { [] }; case (?c) { c } };
        carts.add(caller, cart.concat([{ productId; quantity }]));
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };
    let cart = switch (carts.get(caller)) { case (null) { [] }; case (?c) { c } };
    carts.add(caller, cart.filter(func(item) { item.productId != productId }));
  };

  public shared ({ caller }) func updateCartQuantity(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };
    let cart = switch (carts.get(caller)) { case (null) { [] }; case (?c) { c } };
    carts.add(caller, cart.map(func(item) {
      if (item.productId == productId) { { productId; quantity } } else { item };
    }));
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (carts.get(caller)) { case (null) { [] }; case (?c) { c } };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // --- Order Management ---
  public shared ({ caller }) func placeOrderWithMethod(shippingAddress : Text, paymentMethod : Text, customerName : Text, customerPhone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) { c };
    };
    if (cart.size() == 0) { Runtime.trap("Cart is empty") };
    let orderItems = cart.map(func(item) {
      let price = switch (products.get(item.productId)) {
        case (null) { 0 }; case (?p) { p.price };
      };
      { productId = item.productId; quantity = item.quantity; priceAtPurchase = price };
    });
    let total = orderItems.foldLeft(0, func(acc, item) {
      acc + (item.quantity * item.priceAtPurchase);
    });
    orders.add(nextOrderId, {
      id = nextOrderId; userId = caller; items = orderItems;
      totalAmount = total; status = "pending"; createdAt = Time.now();
      shippingAddress; paymentMethod; customerName; customerPhone;
    });
    carts.remove(caller);
    nextOrderId += 1;
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    orders.values().toArray().filter(func(o) { o.userId == caller });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { orders.add(orderId, { order with status }) };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Users can cancel their own pending/processing orders
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only cancel your own orders");
        };
        if (order.status != "pending" and order.status != "processing") {
          Runtime.trap("Cannot cancel order with status: " # order.status);
        };
        orders.add(orderId, { order with status = "cancelled" });
      };
    };
  };

  public query ({ caller }) func getStoreStats() : async StoreStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view store statistics");
    };
    let totalOrders = orders.size();
    let totalRevenue = orders.values().toArray().foldLeft(0, func(acc, o) { acc + o.totalAmount });
    let productCount = products.size();
    var active = 0;
    for (p in products.values()) { if (p.isActive) { active += 1 } };
    { totalOrders; totalRevenue; productCount; activeProductCount = active };
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order { Nat.compare(p1.id, p2.id) };
  };
  module CartItem {
    public func compare(c1 : CartItem, c2 : CartItem) : Order.Order { Nat.compare(c1.productId, c2.productId) };
  };
  module OrderItem {
    public func compare(o1 : OrderItem, o2 : OrderItem) : Order.Order {
      switch (Nat.compare(o1.productId, o2.productId)) {
        case (#equal) { Nat.compare(o1.quantity, o2.quantity) }; case (o) { o };
      };
    };
  };
  module StoreStats {
    public func compare(s1 : StoreStats, s2 : StoreStats) : Order.Order {
      switch (Nat.compare(s1.totalOrders, s2.totalOrders)) {
        case (#equal) { Nat.compare(s1.totalRevenue, s2.totalRevenue) }; case (o) { o };
      };
    };
  };
};

