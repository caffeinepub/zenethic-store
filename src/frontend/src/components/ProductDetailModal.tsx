import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";
import { getExtraImages } from "../utils/imageStorage";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

function getFakeRating(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rating = 3.5 + (hash % 15) / 10;
  const count = 100 + (hash % 9000);
  return { rating: Math.min(5, Number(rating.toFixed(1))), count };
}

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

export function ProductDetailModal({
  product,
  open,
  onClose,
}: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef(0);

  const allImages = product
    ? [product.imageUrl, ...getExtraImages(product.id)].filter(Boolean)
    : [];

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on product id change
  useEffect(() => {
    setCurrentIdx(0);
  }, [product?.id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setCurrentIdx((i) =>
        diff > 0 ? Math.min(i + 1, allImages.length - 1) : Math.max(i - 1, 0),
      );
    }
  };

  const addToCart = useAddToCart();

  if (!product) return null;

  const price = Number(product.price) / 100;
  const originalPrice = Math.ceil(price * 1.3);
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const stockNum = Number(product.stockQuantity);
  const isLowStock = stockNum > 0 && stockNum <= 5;
  const inStock = stockNum > 0;
  const { rating, count } = getFakeRating(String(product.id));

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

  const handleBuyNow = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(qty),
      });
      onClose();
      window.dispatchEvent(new CustomEvent("openCart"));
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="product.modal"
        className="max-h-[92vh] max-w-4xl overflow-y-auto border-0 bg-white p-0"
      >
        {/* Close button */}
        <button
          type="button"
          data-ocid="product.modal.close_button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row">
          {/* Left: image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col md:w-[42%] md:flex-shrink-0"
          >
            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex flex-row gap-2 overflow-x-auto p-3 md:flex-col md:overflow-y-auto">
                {allImages.map((img, idx) => (
                  <button
                    // biome-ignore lint/suspicious/noArrayIndexKey: thumbnails use index
                    key={idx}
                    type="button"
                    data-ocid={`product.modal.thumbnail.${idx + 1}`}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${
                      idx === currentIdx
                        ? "border-blue-600"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={
                        img ||
                        "/assets/generated/product-handbag.dim_600x600.jpg"
                      }
                      alt={`View ${idx + 1}`}
                      className="h-full w-full bg-gray-50 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/generated/product-handbag.dim_600x600.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div
              className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={
                  allImages[currentIdx] ||
                  "/assets/generated/product-handbag.dim_600x600.jpg"
                }
                alt={product.name}
                className="h-full w-full object-contain p-4 transition-opacity duration-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/generated/product-handbag.dim_600x600.jpg";
                }}
              />

              {/* Nav arrows */}
              {currentIdx > 0 && (
                <button
                  type="button"
                  data-ocid="product.modal.prev_image"
                  onClick={() => setCurrentIdx((i) => Math.max(i - 1, 0))}
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>
              )}
              {currentIdx < allImages.length - 1 && (
                <button
                  type="button"
                  data-ocid="product.modal.next_image"
                  onClick={() =>
                    setCurrentIdx((i) => Math.min(i + 1, allImages.length - 1))
                  }
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              )}

              {/* Dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {allImages.map((_, idx) => (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: dots use index
                      key={idx}
                      type="button"
                      data-ocid={`product.modal.dot.${idx + 1}`}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        idx === currentIdx
                          ? "w-5 bg-blue-600"
                          : "w-1.5 bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Out of stock overlay */}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <span className="rounded border border-gray-400 bg-white px-3 py-1 text-sm font-bold uppercase tracking-wider text-gray-600">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: product details */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="flex flex-1 flex-col bg-white p-5 md:p-6"
          >
            {/* Category */}
            <span className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-600">
              {product.category}
            </span>

            {/* Name */}
            <h2 className="mb-3 text-xl font-semibold leading-snug text-gray-900 md:text-2xl">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded bg-green-600 px-2 py-0.5">
                <span className="text-sm font-bold text-white">{rating}</span>
                <svg
                  aria-hidden="true"
                  className="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d={STAR_PATH} />
                </svg>
              </div>
              <span className="text-sm text-gray-500">
                {count.toLocaleString()} Ratings
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-medium text-blue-600">
                Zenethic Verified
              </span>
            </div>

            {/* Price */}
            <div className="mb-1 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{price.toFixed(0)}
              </span>
              <span className="text-base text-gray-400 line-through">
                ₹{originalPrice}
              </span>
              <span className="text-base font-semibold text-green-600">
                {discount}% off
              </span>
            </div>
            <p className="mb-4 text-xs text-gray-500">Inclusive of all taxes</p>

            <hr className="mb-4 border-gray-100" />

            {/* Stock status */}
            <div className="mb-4">
              {inStock ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    {isLowStock
                      ? `Only ${stockNum} left — order soon`
                      : "In Stock"}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-red-500">
                  Currently unavailable
                </span>
              )}
            </div>

            {/* Delivery info */}
            <div className="mb-4 space-y-2 rounded-sm bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-700">
                  <strong>FREE Delivery</strong> on orders over ₹499
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-700">
                  Easy 7-day returns &amp; exchanges
                </span>
              </div>
            </div>

            {/* Qty stepper */}
            {inStock && (
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded border border-gray-300">
                    <button
                      type="button"
                      data-ocid="product.modal.qty_minus"
                      className="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="flex h-9 w-12 items-center justify-center border-x border-gray-300 text-sm font-bold text-gray-900">
                      {qty}
                    </span>
                    <button
                      type="button"
                      data-ocid="product.modal.qty_plus"
                      className="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                      onClick={() => setQty(Math.min(stockNum || 99, qty + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {stockNum} available
                  </span>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="space-y-3">
              <Button
                data-ocid="product.modal.add_to_cart_button"
                className="h-11 w-full rounded-sm border border-amber-500 bg-amber-400 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-amber-500"
                disabled={addToCart.isPending || !inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Button>

              {inStock && (
                <Button
                  data-ocid="product.modal.buy_now_button"
                  className="h-11 w-full rounded-sm bg-orange-500 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                  disabled={addToCart.isPending}
                  onClick={handleBuyNow}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Buy Now
                </Button>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="mb-2 border-b border-gray-100 pb-2 text-sm font-bold text-gray-900">
                Product Description
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {product.description ||
                  "Premium quality product from Zenethic. Curated for Gen Z tastes — trendy, durable, and delivered fast."}
              </p>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
