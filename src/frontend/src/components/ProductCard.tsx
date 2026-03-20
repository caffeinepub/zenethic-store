import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";
import { ProductDetailModal } from "./ProductDetailModal";

interface ProductCardProps {
  product: Product;
  index: number;
  showBestSeller?: boolean;
}

function getFakeRating(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rating = 3.5 + (hash % 15) / 10;
  const count = 100 + (hash % 9000);
  return { rating: Math.min(5, Number(rating.toFixed(1))), count };
}

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

export function ProductCard({
  product,
  index,
  showBestSeller,
}: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const addToCart = useAddToCart();

  const price = Number(product.price) / 100;
  const originalPrice = Math.ceil(price * 1.35);
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const stockNum = Number(product.stockQuantity);
  const ocidIndex = index + 1;
  const { rating, count } = getFakeRating(String(product.id));

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(1),
      });
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(1),
      });
      window.dispatchEvent(new CustomEvent("openCart"));
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <>
      <motion.div
        data-ocid={`products.item.${ocidIndex}`}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
        className="product-card-shadow group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow duration-200"
      >
        {/* Product Image */}
        <button
          type="button"
          className="relative aspect-square cursor-pointer overflow-hidden bg-gray-50"
          onClick={() => setModalOpen(true)}
          aria-label={`View details for ${product.name}`}
        >
          <img
            src={
              product.imageUrl ||
              "/assets/generated/zenethic-hero-products.dim_800x700.png"
            }
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/generated/zenethic-hero-products.dim_800x700.png";
            }}
          />

          {/* Best Seller badge */}
          {showBestSeller && (
            <div
              className="absolute left-0 top-2 px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: "oklch(50% 0.18 15)" }}
            >
              BEST SELLER
            </div>
          )}

          {/* Discount badge */}
          {!showBestSeller && discount > 0 && (
            <div className="absolute left-2 top-2 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {discount}% off
            </div>
          )}

          {/* Sold out overlay */}
          {stockNum === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                Out of Stock
              </span>
            </div>
          )}
        </button>

        {/* Product Info */}
        <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
          {/* Product Name — Amazon style: semibold, 2-line clamp, dark */}
          <h3 className="mb-2 line-clamp-2 min-h-[2.8rem] text-sm font-semibold leading-snug text-gray-900">
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  aria-hidden="true"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill={star <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
                >
                  <path d={STAR_PATH} />
                </svg>
              ))}
            </div>
            <span className="text-xs font-semibold text-amber-600">
              {rating}
            </span>
            <span className="text-xs text-gray-400">
              ({count.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="mb-1 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">
              ₹{price.toFixed(0)}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice}
            </span>
            <span className="text-xs font-semibold text-green-600">
              {discount}% off
            </span>
          </div>

          {/* Free delivery */}
          <p className="mb-3 text-[11px] text-gray-400">FREE Delivery</p>

          {/* Buttons */}
          <div className="mt-auto space-y-2">
            <Button
              data-ocid={`products.item.${ocidIndex}.add_to_cart_button`}
              className="h-9 w-full rounded-lg border-0 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "oklch(50% 0.18 15)" }}
              disabled={addToCart.isPending || stockNum === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Add to Cart
            </Button>

            <Button
              data-ocid={`products.item.${ocidIndex}.buy_now_button`}
              variant="outline"
              className="h-9 w-full rounded-lg text-xs font-bold text-orange-600 border-orange-200 shadow-sm transition-all hover:bg-orange-50"
              disabled={addToCart.isPending || stockNum === 0}
              onClick={handleBuyNow}
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Buy Now
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
