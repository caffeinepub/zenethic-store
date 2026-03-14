import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCart,
  useCreateCheckoutSession,
  useProducts,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "../hooks/useQueries";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { data: cartItems = [] } = useCart();
  const { data: products = [] } = useProducts();
  const removeFromCart = useRemoveFromCart();
  const updateQty = useUpdateCartQuantity();
  const checkout = useCreateCheckoutSession();

  const cartWithDetails = cartItems.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  const subtotal = cartWithDetails.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + (Number(item.product.price) / 100) * Number(item.quantity);
  }, 0);

  const handleCheckout = async () => {
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

  return (
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
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
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
                          onClick={() => removeFromCart.mutate(item.productId)}
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
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="gold-text font-display text-lg font-bold">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <Button
                data-ocid="cart.checkout_button"
                className="gold-gradient w-full border-0 font-semibold text-primary-foreground hover:opacity-90"
                onClick={handleCheckout}
                disabled={checkout.isPending}
              >
                {checkout.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Secure checkout powered by Stripe
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
