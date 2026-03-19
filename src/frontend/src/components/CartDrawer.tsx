import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type GuestOrder,
  generateOrderId,
  saveGuestOrder,
} from "../hooks/useGuestOrders";
import {
  CART_CACHE_KEY,
  useCart,
  useCreateCheckoutSession,
  useGetUpiId,
  usePlaceOrderWithMethod,
  useProducts,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "../hooks/useQueries";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
}

function CheckoutModal({
  open,
  onClose,
  subtotal,
  cartItems,
  products,
}: {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  cartItems: any[];
  products: any[];
}) {
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    phone: "",
    address: "",
  });
  const [paymentTab, setPaymentTab] = useState("stripe");
  const [upiOrderPlaced, setUpiOrderPlaced] = useState(false);

  const checkout = useCreateCheckoutSession();
  const placeOrder = usePlaceOrderWithMethod();
  const { data: upiId = "" } = useGetUpiId();
  const queryClient = useQueryClient();

  const cartWithDetails = cartItems.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  const handleStripe = async () => {
    try {
      const items = cartWithDetails
        .filter((item) => item.product)
        .map((item) => ({
          productName: item.product!.name,
          productDescription: item.product!.description,
          currency: "inr",
          quantity: item.quantity,
          priceInCents: item.product!.price,
        }));
      const baseUrl = window.location.href.split("?")[0];
      const url = await checkout.mutateAsync({
        items,
        successUrl: `${baseUrl}?payment=success`,
        cancelUrl: `${baseUrl}?payment=cancel`,
      });
      window.location.href = url;
    } catch {
      toast.error("Checkout failed. Please configure Stripe first.");
    }
  };

  const handleCod = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!form.address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    try {
      const guestOrderCod: GuestOrder = {
        id: generateOrderId(),
        customerName: form.name,
        customerPhone: form.phone,
        shippingAddress: form.address,
        paymentMethod: "cod",
        items: cartWithDetails
          .filter((item) => item.product)
          .map((item) => ({
            productId: String(item.productId),
            productName: item.product!.name,
            quantity: Number(item.quantity),
            priceAtPurchase:
              Number(item.product!.price) * Number(item.quantity),
          })),
        totalAmount: Math.round(subtotal * 100),
        status: "pending",
        createdAt: Date.now(),
      };

      // Save locally FIRST — always succeeds regardless of backend
      saveGuestOrder(guestOrderCod);
      localStorage.removeItem(CART_CACHE_KEY);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed successfully! Pay cash on delivery.");
      onClose();

      // Sync to backend in background (fire and forget)
      placeOrder
        .mutateAsync({
          shippingAddress: form.address,
          paymentMethod: "cod",
          customerName: form.name,
          customerPhone: form.phone,
        })
        .catch((err) =>
          console.warn("Backend sync for COD order failed:", err),
        );
    } catch (err) {
      console.error("COD order error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleUpiPlaceOrder = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!form.address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    try {
      const guestOrderUpi: GuestOrder = {
        id: generateOrderId(),
        customerName: form.name,
        customerPhone: form.phone,
        shippingAddress: form.address,
        paymentMethod: "upi",
        items: cartWithDetails
          .filter((item) => item.product)
          .map((item) => ({
            productId: String(item.productId),
            productName: item.product!.name,
            quantity: Number(item.quantity),
            priceAtPurchase:
              Number(item.product!.price) * Number(item.quantity),
          })),
        totalAmount: Math.round(subtotal * 100),
        status: "pending",
        createdAt: Date.now(),
      };

      // Save locally FIRST — always succeeds regardless of backend
      saveGuestOrder(guestOrderUpi);
      localStorage.removeItem(CART_CACHE_KEY);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setUpiOrderPlaced(true);

      // Sync to backend in background (fire and forget)
      placeOrder
        .mutateAsync({
          shippingAddress: form.address,
          paymentMethod: "upi",
          customerName: form.name,
          customerPhone: form.phone,
        })
        .catch((err) =>
          console.warn("Backend sync for UPI order failed:", err),
        );
    } catch (err) {
      console.error("UPI order error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Zenethic&am=${subtotal.toFixed(2)}&cu=INR&tn=Order%20Payment`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="checkout.dialog"
        className="border-gray-200 bg-white text-black sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-black">
            Choose Payment Method
          </DialogTitle>
          <p className="text-sm text-gray-700">
            Total:{" "}
            <span className="gold-text font-bold text-base">
              ₹{subtotal.toFixed(2)}
            </span>
          </p>
        </DialogHeader>

        <Tabs
          value={paymentTab}
          onValueChange={(v) => {
            setPaymentTab(v);
            setUpiOrderPlaced(false);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 border border-gray-200 bg-gray-100">
            <TabsTrigger
              data-ocid="checkout.stripe.tab"
              value="stripe"
              className="flex items-center gap-1.5 text-xs text-black data-[state=active]:text-black"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Stripe
            </TabsTrigger>
            <TabsTrigger
              data-ocid="checkout.upi.tab"
              value="upi"
              className="flex items-center gap-1.5 text-xs text-black data-[state=active]:text-black"
            >
              <Smartphone className="h-3.5 w-3.5" />
              UPI
            </TabsTrigger>
            <TabsTrigger
              data-ocid="checkout.cod.tab"
              value="cod"
              className="flex items-center gap-1.5 text-xs text-black data-[state=active]:text-black"
            >
              <Banknote className="h-3.5 w-3.5" />
              COD
            </TabsTrigger>
          </TabsList>

          {/* Stripe Tab */}
          <TabsContent value="stripe" className="mt-4 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md border border-primary/20 bg-primary/5 p-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-black">
                    Credit / Debit Card
                  </p>
                  <p className="text-xs text-gray-600">
                    Secure payment via Stripe
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                You will be redirected to Stripe's secure checkout page.
              </p>
            </div>
            <Button
              data-ocid="checkout.stripe.submit_button"
              className="gold-gradient w-full border-0 font-semibold text-primary-foreground hover:opacity-90"
              onClick={handleStripe}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                "Pay with Stripe"
              )}
            </Button>
          </TabsContent>

          {/* UPI Tab */}
          <TabsContent value="upi" className="mt-4 space-y-3">
            {!upiId ? (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-50 p-4 text-center">
                <Smartphone className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                <p className="text-sm font-medium text-yellow-700">
                  UPI payments are not set up yet.
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Please use COD or ask the store owner to configure UPI.
                </p>
              </div>
            ) : upiOrderPlaced ? (
              /* Payment confirmation view */
              <div className="space-y-4">
                <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-center">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <p className="font-semibold text-sm text-green-700">
                    Order placed! Now complete your payment:
                  </p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-gray-50 p-4 space-y-2">
                  <p className="text-xs text-gray-600">Pay to UPI ID:</p>
                  <p className="font-mono font-bold text-lg text-primary break-all">
                    {upiId}
                  </p>
                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-600">Amount:</p>
                    <p className="font-display text-2xl font-bold gold-text">
                      ₹{subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  data-ocid="checkout.upi.submit_button"
                  className="gold-gradient w-full border-0 font-semibold text-primary-foreground hover:opacity-90"
                  onClick={() => window.open(upiDeepLink, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Pay Now via UPI App
                </Button>
                <p className="text-xs text-center text-gray-600">
                  After paying, your order will be confirmed once we verify the
                  payment.
                </p>
                <Button
                  data-ocid="checkout.upi.close_button"
                  variant="outline"
                  className="w-full border-gray-300 text-black"
                  onClick={onClose}
                >
                  Done
                </Button>
              </div>
            ) : (
              /* Order form view */
              <>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs text-gray-700 mb-1">
                    Pay ₹{subtotal.toFixed(2)} to UPI ID:
                  </p>
                  <p className="font-mono font-bold text-sm text-primary">
                    {upiId}
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    Fill your details below, then we'll show you how to pay.
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="upi-name" className="text-xs text-black">
                      Full Name
                    </Label>
                    <Input
                      id="upi-name"
                      data-ocid="checkout.upi.name_input"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="text-black placeholder:text-gray-400 bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upi-phone" className="text-xs text-black">
                      Phone Number
                    </Label>
                    <Input
                      id="upi-phone"
                      data-ocid="checkout.upi.input"
                      placeholder="+91 9XXXXXXXXX"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="text-black placeholder:text-gray-400 bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upi-address" className="text-xs text-black">
                      Delivery Address
                    </Label>
                    <Textarea
                      id="upi-address"
                      data-ocid="checkout.upi.textarea"
                      placeholder="House/flat number, street, city, pincode"
                      rows={2}
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      className="text-black placeholder:text-gray-400 bg-white border-gray-300"
                    />
                  </div>
                </div>
                <Button
                  data-ocid="checkout.upi.primary_button"
                  className="gold-gradient w-full border-0 font-semibold text-primary-foreground hover:opacity-90"
                  onClick={handleUpiPlaceOrder}
                >
                  Place Order & Pay via UPI
                </Button>
              </>
            )}
          </TabsContent>

          {/* COD Tab */}
          <TabsContent value="cod" className="mt-4 space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm text-black">
                  Cash on Delivery
                </p>
              </div>
              <p className="text-xs text-gray-700">
                Pay ₹{subtotal.toFixed(2)} in cash when your order is delivered.
                No advance payment required.
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="cod-name" className="text-xs text-black">
                  Full Name
                </Label>
                <Input
                  id="cod-name"
                  data-ocid="checkout.cod.name_input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="text-black placeholder:text-gray-400 bg-white border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="cod-phone" className="text-xs text-black">
                  Phone Number
                </Label>
                <Input
                  id="cod-phone"
                  data-ocid="checkout.cod.input"
                  placeholder="+91 9XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="text-black placeholder:text-gray-400 bg-white border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="cod-address" className="text-xs text-black">
                  Delivery Address
                </Label>
                <Textarea
                  id="cod-address"
                  data-ocid="checkout.cod.textarea"
                  placeholder="House/flat number, street, city, pincode"
                  rows={2}
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="text-black placeholder:text-gray-400 bg-white border-gray-300"
                />
              </div>
            </div>
            <Button
              data-ocid="checkout.cod.submit_button"
              className="gold-gradient w-full border-0 font-semibold text-primary-foreground hover:opacity-90"
              onClick={handleCod}
            >
              Place Order (COD)
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { data: cartItems = [] } = useCart();
  const { data: products = [] } = useProducts();
  const removeFromCart = useRemoveFromCart();
  const updateQty = useUpdateCartQuantity();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const cartWithDetails = cartItems.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  const subtotal = cartWithDetails.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + (Number(item.product.price) / 100) * Number(item.quantity);
  }, 0);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          data-ocid="cart.drawer"
          side="right"
          className="flex w-full flex-col border-border/50 bg-card p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border/50 px-6 py-4">
            <SheetTitle className="font-display text-xl">
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Your Cart
                {cartItems.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"}
                  </span>
                )}
              </span>
            </SheetTitle>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div
              data-ocid="cart.empty_state"
              className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center"
            >
              <div className="rounded-full border border-primary/20 p-8">
                <ShoppingBag className="h-12 w-12 text-primary/40" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Discover our curated collection
                </p>
              </div>
              <Button
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="space-y-0 px-6">
                  {cartWithDetails.map((item, i) => (
                    <div
                      key={String(item.productId)}
                      data-ocid={`cart.item.${i + 1}`}
                      className="flex gap-4 py-5"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted">
                        {item.product && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium leading-tight line-clamp-2">
                            {item.product?.name ?? "Unknown Product"}
                          </h4>
                          <button
                            type="button"
                            className="text-muted-foreground transition-colors hover:text-destructive"
                            onClick={() =>
                              removeFromCart.mutate(item.productId)
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {item.product && (
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {item.product.category}
                          </span>
                        )}

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-md border border-border">
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                const newQty = Number(item.quantity) - 1;
                                if (newQty < 1) {
                                  removeFromCart.mutate(item.productId);
                                } else {
                                  updateQty.mutate({
                                    productId: item.productId,
                                    quantity: BigInt(newQty),
                                  });
                                }
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-6 w-8 items-center justify-center text-xs font-medium">
                              {String(item.quantity)}
                            </span>
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                              onClick={() =>
                                updateQty.mutate({
                                  productId: item.productId,
                                  quantity: item.quantity + 1n,
                                })
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          {item.product && (
                            <span className="gold-text text-sm font-bold">
                              ₹
                              {(
                                (Number(item.product.price) / 100) *
                                Number(item.quantity)
                              ).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t border-border/50 px-6 py-4">
                <div className="mb-4 flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="gold-text font-display text-lg font-bold">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  data-ocid="cart.checkout_button"
                  className="gold-gradient w-full border-0 font-semibold text-primary-foreground hover:opacity-90"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Proceed to Checkout
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Stripe · UPI · Cash on Delivery
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        subtotal={subtotal}
        cartItems={cartItems}
        products={products}
      />
    </>
  );
}
