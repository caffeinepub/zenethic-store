import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart } from "../hooks/useQueries";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();
  const { identity } = useInternetIdentity();

  const price = Number(product.price) / 100;
  const stockNum = Number(product.stockQuantity);
  const isLowStock = stockNum > 0 && stockNum <= 5;
  const ocidIndex = index + 1;

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error("Please login to add items to cart");
      return;
    }
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
    <motion.div
      data-ocid={`products.item.${ocidIndex}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
    >
      {/* Image — taller aspect for fashion feel */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={
            product.imageUrl ||
            "/assets/generated/product-handbag.dim_600x600.jpg"
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/generated/product-handbag.dim_600x600.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <Badge className="absolute left-3 top-3 border-0 bg-primary/90 text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
          {product.category}
        </Badge>
        {stockNum === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="font-display text-sm font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
        {isLowStock && (
          <div className="absolute bottom-3 right-3">
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              Low Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 font-display text-base font-semibold leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="mb-3 flex-1 text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto">
          {/* Gold separator */}
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="mb-3 flex items-center justify-between">
            <span className="gold-text font-display text-xl font-bold">
              ₹{price.toFixed(2)}
            </span>
            {!isLowStock && stockNum > 0 && (
              <span className="text-xs text-muted-foreground">
                {stockNum} left
              </span>
            )}
          </div>

          {/* Qty stepper */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span
                data-ocid="product.quantity_input"
                className="flex h-8 w-8 items-center justify-center text-sm font-medium"
              >
                {qty}
              </span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setQty(Math.min(stockNum, qty + 1))}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Full-width Add to Cart */}
          <Button
            data-ocid="product.add_to_cart_button"
            className="gold-gradient w-full border-0 text-xs font-semibold text-primary-foreground hover:opacity-90"
            disabled={addToCart.isPending || stockNum === 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
