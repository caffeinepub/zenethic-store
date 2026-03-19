import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";
import { ProductDetailModal } from "./ProductDetailModal";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const addToCart = useAddToCart();

  const price = Number(product.price) / 100;
  const stockNum = Number(product.stockQuantity);
  const isLowStock = stockNum > 0 && stockNum <= 5;
  const ocidIndex = index + 1;

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(qty),
      });
      toast.success(`${product.name} added to cart`);
      setQty(1);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <>
      <motion.div
        data-ocid={`products.item.${ocidIndex}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
        className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300"
        style={{ borderColor: "oklch(20% 0.015 280)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "oklch(55% 0.23 15 / 0.45)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 1px oklch(55% 0.23 15 / 0.2), 0 16px 40px -8px oklch(55% 0.23 15 / 0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "oklch(20% 0.015 280)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Image — clickable button to open modal */}
        <button
          type="button"
          className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted"
          onClick={() => setModalOpen(true)}
          aria-label={`View details for ${product.name}`}
        >
          <img
            src={
              product.imageUrl ||
              "/assets/generated/product-handbag.dim_600x600.jpg"
            }
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/generated/product-handbag.dim_600x600.jpg";
            }}
          />

          {/* Crimson overlay on hover */}
          <div
            className="absolute inset-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0"
            style={{
              background:
                "linear-gradient(to top, oklch(55% 0.23 15 / 0.3) 0%, transparent 60%)",
            }}
          />

          {/* View Details overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundColor: "oklch(5% 0.005 280 / 0.35)" }}
          >
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "oklch(8% 0.008 280 / 0.85)",
                color: "oklch(97% 0.005 280)",
                border: "1px solid oklch(55% 0.23 15 / 0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Eye
                className="h-3.5 w-3.5"
                style={{ color: "oklch(65% 0.22 15)" }}
              />
              View Details
            </div>
          </div>

          {/* Category badge */}
          <Badge
            className="absolute left-3 top-3 border-0 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: "oklch(55% 0.23 15)",
              color: "oklch(98% 0.003 280)",
            }}
          >
            {product.category}
          </Badge>

          {/* Low stock */}
          {isLowStock && (
            <div className="absolute bottom-3 right-3">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: "oklch(10% 0.009 280 / 0.85)",
                  color: "oklch(70% 0.18 55)",
                }}
              >
                Only {stockNum} left
              </span>
            </div>
          )}

          {/* Sold out overlay */}
          {stockNum === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: "oklch(5% 0.005 280 / 0.75)" }}
            >
              <span
                className="font-display text-sm font-bold uppercase tracking-[0.2em]"
                style={{ color: "oklch(95% 0.005 280)" }}
              >
                SOLD OUT
              </span>
            </div>
          )}
        </button>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-1 font-display text-sm font-semibold leading-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="mb-3 flex-1 text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="mt-auto">
            <div
              className="my-3 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(55% 0.23 15 / 0.25), transparent)",
              }}
            />

            <div className="mb-3 flex items-center justify-between">
              <span
                className="font-display text-xl font-bold"
                style={{ color: "oklch(65% 0.22 15)" }}
              >
                ₹{price.toFixed(2)}
              </span>
              {stockNum > 0 && !isLowStock && (
                <span className="text-xs text-muted-foreground">
                  {stockNum} in stock
                </span>
              )}
            </div>

            {/* Qty stepper */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex items-center rounded-full"
                style={{ border: "1px solid oklch(20% 0.015 280)" }}
              >
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="flex h-7 w-7 items-center justify-center text-xs font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setQty(Math.min(stockNum || 99, qty + 1))}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <Button
              data-ocid={`products.item.${ocidIndex}.add_to_cart_button`}
              className="crimson-gradient w-full rounded-full border-0 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-90 hover:shadow-crimson-sm"
              style={{ color: "oklch(98% 0.003 280)" }}
              disabled={addToCart.isPending || stockNum === 0}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              ADD
            </Button>
          </div>
        </div>
      </motion.div>

      <ProductDetailModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
