import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onShopNow: () => void;
}

export function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section className="py-5" aria-label="Hero banner">
      <div className="container mx-auto px-4">
        {/* Hero card with rounded corners and pink-lavender gradient */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(83% 0.055 15) 0%, oklch(88% 0.028 340) 50%, oklch(88% 0.032 280) 100%)",
            minHeight: "320px",
          }}
        >
          {/* Carousel arrow left */}
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 shadow-sm transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>

          {/* Carousel arrow right */}
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 shadow-sm transition-colors hover:bg-white"
          >
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>

          <div className="flex flex-col items-center gap-6 px-12 py-10 md:flex-row md:gap-0 md:py-0">
            {/* Left: text content */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start justify-center gap-5 md:min-h-[300px] md:w-1/2 md:pr-8 md:py-12"
            >
              {/* Headline */}
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
                <span className="font-extrabold">Trending</span>{" "}
                <span className="font-normal">Deals of the Week</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-xs text-sm leading-relaxed text-gray-600">
                Best Offers on Perfumes &amp; Skincare
              </p>

              {/* CTA */}
              <Button
                data-ocid="hero.shop_now.primary_button"
                onClick={onShopNow}
                className="rounded-xl px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 border-0"
                style={{ backgroundColor: "oklch(50% 0.18 15)" }}
              >
                Shop Now
              </Button>

              {/* Mini trust bullets */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> Free Shipping ₹499+
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> COD Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">✓</span> Easy Returns
                </span>
              </div>
            </motion.div>

            {/* Right: hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex items-center justify-center md:w-1/2"
            >
              <img
                src="/assets/generated/zenethic-hero-products.dim_800x700.png"
                alt="Trending perfumes and skincare products"
                className="relative z-10 h-[220px] w-auto object-contain drop-shadow-lg sm:h-[260px] md:h-[300px]"
              />

              {/* Floating price badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
                className="absolute -right-2 bottom-8 rounded-2xl border border-border bg-white px-4 py-2.5"
                style={{ boxShadow: "0 4px 16px rgba(17,24,39,0.10)" }}
              >
                <p className="text-[10px] font-medium text-gray-400">
                  Starting from
                </p>
                <p
                  className="font-display text-lg font-extrabold"
                  style={{ color: "oklch(50% 0.18 15)" }}
                >
                  ₹299
                </p>
              </motion.div>

              {/* Floating rating badge */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 1.0,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
                className="absolute -left-2 top-8 flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2"
                style={{ boxShadow: "0 4px 16px rgba(17,24,39,0.10)" }}
              >
                <span className="text-base">⭐</span>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    4.8/5 Rating
                  </p>
                  <p className="text-[10px] text-gray-400">2k+ Reviews</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
