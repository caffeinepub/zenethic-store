import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  open,
  onClose,
}: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();

  if (!product) return null;

  const price = Number(product.price) / 100;
  const stockNum = Number(product.stockQuantity);
  const isLowStock = stockNum > 0 && stockNum <= 5;
  const inStock = stockNum > 0;

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(qty),
      });
      toast.success(`${product.name} added to cart`);
      onClose();
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="product.modal"
        className="max-h-[90vh] max-w-3xl overflow-y-auto border-0 p-0"
        style={{
          backgroundColor: "oklch(8% 0.008 280)",
          border: "1px solid oklch(20% 0.015 280)",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          data-ocid="product.modal.close_button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: "oklch(70% 0.01 280)" }}
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative w-full flex-shrink-0 md:w-[45%]"
          >
            <div
              className="relative aspect-[4/5] overflow-hidden md:rounded-l-lg"
              style={{ backgroundColor: "oklch(12% 0.008 280)" }}
            >
              <img
                src={
                  product.imageUrl ||
                  "/assets/generated/product-handbag.dim_600x600.jpg"
                }
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/generated/product-handbag.dim_600x600.jpg";
                }}
              />

              {/* Category badge */}
              <Badge
                className="absolute left-3 top-3 border-0 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: "oklch(55% 0.23 15)",
                  color: "oklch(98% 0.003 280)",
                }}
              >
                {product.category}
              </Badge>

              {/* Stock overlay */}
              {!inStock && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "oklch(5% 0.005 280 / 0.8)" }}
                >
                  <span
                    className="font-display text-lg font-black uppercase tracking-[0.2em]"
                    style={{ color: "oklch(95% 0.005 280)" }}
                  >
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-1 flex-col p-6"
          >
            {/* Rating row (decorative) */}
            <div className="mb-3 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-3.5 w-3.5 fill-current"
                  style={{
                    color:
                      s <= 4 ? "oklch(70% 0.18 55)" : "oklch(40% 0.01 280)",
                  }}
                />
              ))}
              <span
                className="ml-1 text-xs"
                style={{ color: "oklch(55% 0.015 280)" }}
              >
                4.0 · Zenethic Verified
              </span>
            </div>

            {/* Product name */}
            <h2
              className="mb-3 font-display text-xl font-black leading-tight tracking-tight md:text-2xl"
              style={{ color: "oklch(97% 0.005 280)" }}
            >
              {product.name}
            </h2>

            {/* Price block */}
            <div className="mb-4 flex items-baseline gap-3">
              <span
                className="font-display text-3xl font-black"
                style={{ color: "oklch(65% 0.22 15)" }}
              >
                ₹{price.toFixed(2)}
              </span>
              <span
                className="text-sm line-through"
                style={{ color: "oklch(45% 0.01 280)" }}
              >
                ₹{(price * 1.3).toFixed(2)}
              </span>
              <span
                className="rounded px-2 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: "oklch(55% 0.23 15 / 0.15)",
                  color: "oklch(65% 0.22 15)",
                }}
              >
                23% OFF
              </span>
            </div>

            {/* Divider */}
            <div
              className="mb-4 h-px"
              style={{
                background:
                  "linear-gradient(to right, oklch(55% 0.23 15 / 0.3), transparent)",
              }}
            />

            {/* Stock status */}
            <div className="mb-4">
              {inStock ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: "oklch(62% 0.2 145)" }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "oklch(62% 0.2 145)" }}
                  >
                    {isLowStock
                      ? `Only ${stockNum} left in stock — order soon`
                      : "In Stock"}
                  </span>
                </div>
              ) : (
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(60% 0.22 15)" }}
                >
                  Currently unavailable
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3
                className="mb-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(55% 0.23 15)" }}
              >
                About this item
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(72% 0.01 280)" }}
              >
                {product.description ||
                  "Premium quality product from Zenethic. Curated for Gen Z tastes — trendy, durable, and delivered fast."}
              </p>
            </div>

            {/* Delivery info */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <Truck
                  className="h-4 w-4"
                  style={{ color: "oklch(55% 0.23 15)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "oklch(65% 0.01 280)" }}
                >
                  Free delivery on orders over ₹499
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package
                  className="h-4 w-4"
                  style={{ color: "oklch(55% 0.23 15)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "oklch(65% 0.01 280)" }}
                >
                  Easy 7-day returns
                </span>
              </div>
            </div>

            {/* Qty stepper */}
            {inStock && (
              <div className="mb-4">
                <p
                  className="mb-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: "oklch(55% 0.23 15)" }}
                >
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center overflow-hidden rounded-full"
                    style={{ border: "1px solid oklch(28% 0.015 280)" }}
                  >
                    <button
                      type="button"
                      data-ocid="product.modal.qty_minus"
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-white/10"
                      style={{ color: "oklch(70% 0.01 280)" }}
                      onClick={() => setQty(Math.max(1, qty - 1))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className="flex h-9 w-10 items-center justify-center text-sm font-bold"
                      style={{ color: "oklch(97% 0.005 280)" }}
                    >
                      {qty}
                    </span>
                    <button
                      type="button"
                      data-ocid="product.modal.qty_plus"
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-white/10"
                      style={{ color: "oklch(70% 0.01 280)" }}
                      onClick={() => setQty(Math.min(stockNum || 99, qty + 1))}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(50% 0.012 280)" }}
                  >
                    {stockNum} available
                  </span>
                </div>
              </div>
            )}

            {/* CTA */}
            <Button
              data-ocid="product.modal.add_to_cart_button"
              className="crimson-gradient w-full rounded-full border-0 py-5 text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 hover:opacity-90 hover:shadow-crimson-sm"
              style={{ color: "oklch(98% 0.003 280)" }}
              disabled={addToCart.isPending || !inStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {inStock ? "ADD TO CART" : "SOLD OUT"}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
