import Map "mo:core/Map";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type NewProduct = {
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

  type NewCartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type NewOrderItem = {
    productId : Nat;
    quantity : Nat;
    priceAtPurchase : Nat;
  };

  type NewOrder = {
    id : Nat;
    userId : Principal;
    items : [NewOrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
    shippingAddress : Text;
    paymentMethod : Text;
    customerName : Text;
    customerPhone : Text;
  };

  type OldActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    upiId : Text;
    stripeConfiguration : ?{ secretKey : Text; allowedCountries : [Text] };
    products : Map.Map<Nat, NewProduct>;
    carts : Map.Map<Principal, [NewCartItem]>;
    orders : Map.Map<Nat, NewOrder>;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor { old };
};
