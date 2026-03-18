import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onShopNow: () => void;
}

const MARQUEE_ITEMS: { id: string; label: string }[] = [
  { id: "m1", label: "FREE SHIPPING" },
  { id: "m2", label: "PREMIUM QUALITY" },
  { id: "m3", label: "EASY RETURNS" },
  { id: "m4", label: "SECURE PAYMENTS" },
  { id: "m5", label: "100% AUTHENTIC" },
  { id: "m6", label: "CASH ON DELIVERY" },
  { id: "m7", label: "UPI PAYMENTS" },
  { id: "m8", label: "FAST DISPATCH" },
  { id: "m9", label: "FREE SHIPPING" },
  { id: "m10", label: "PREMIUM QUALITY" },
  { id: "m11", label: "EASY RETURNS" },
  { id: "m12", label: "SECURE PAYMENTS" },
  { id: "m13", label: "100% AUTHENTIC" },
  { id: "m14", label: "CASH ON DELIVERY" },
  { id: "m15", label: "UPI PAYMENTS" },
  { id: "m16", label: "FAST DISPATCH" },
];

export function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Animated blob background */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="blob-1 absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(55% 0.23 15 / 0.12) 0%, transparent 65%)",
            filter: "blur(48px)",
          }}
        />
        <div
          className="blob-2 absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(35% 0.15 290 / 0.10) 0%, transparent 65%)",
            filter: "blur(64px)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, oklch(55% 0.23 15 / 0.05) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pb-12 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border px-5 py-2"
            style={{
              borderColor: "oklch(55% 0.23 15 / 0.35)",
              backgroundColor: "oklch(55% 0.23 15 / 0.08)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "oklch(55% 0.23 15)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: "oklch(65% 0.22 15)" }}
            >
              New Collection 2026
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-2"
          >
            <h1
              className="font-display font-extrabold leading-[0.92] tracking-[-0.03em]"
              style={{
                fontSize: "clamp(4.5rem, 16vw, 13rem)",
                WebkitTextStroke: "1px oklch(95% 0.005 280 / 0.12)",
              }}
            >
              ZENETHIC
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
          >
            <h2
              className="crimson-text font-display font-extrabold leading-[0.92] tracking-[-0.02em]"
              style={{ fontSize: "clamp(4.5rem, 16vw, 13rem)" }}
            >
              COLLECTION
            </h2>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-8 max-w-sm text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Premium Dropshipping &amp; Reselling Platform
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10"
          >
            <Button
              data-ocid="hero.primary_button"
              size="lg"
              className="crimson-gradient group border-0 px-10 py-6 text-sm font-bold uppercase tracking-[0.15em] shadow-crimson transition-all duration-300 hover:opacity-90"
              style={{ color: "oklch(98% 0.003 280)" }}
              onClick={onShopNow}
            >
              Explore Now
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Marquee ticker */}
      <div
        className="relative overflow-hidden border-y py-4"
        style={{
          borderColor: "oklch(55% 0.23 15 / 0.2)",
          backgroundColor: "oklch(10% 0.009 280)",
        }}
      >
        <div className="marquee-track">
          {MARQUEE_ITEMS.map(({ id, label }) => (
            <span
              key={id}
              className="flex items-center gap-6 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-foreground"
            >
              <span
                className="text-lg font-bold"
                style={{ color: "oklch(55% 0.23 15)" }}
              >
                •
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
