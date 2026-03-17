import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onShopNow: () => void;
}

const TRUST_SIGNALS = [
  "Free Shipping on orders above ₹499",
  "Easy 7-day Returns",
  "Secure Payments",
  "100% Authentic Products",
];

export function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-[560px] w-full md:h-[620px]">
        <img
          src="/assets/generated/zenethic-hero-banner.dim_1400x500.jpg"
          alt="Zenethic — Curated Quality"
          className="h-full w-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm animate-pulse-soft"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Premium Collection
                </span>
              </motion.div>

              {/* Decorative rule */}
              <div className="mb-5 h-px w-16 bg-gradient-to-r from-primary/60 to-transparent" />

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-5 font-display text-6xl font-bold leading-[1.05] tracking-tight md:text-7xl"
              >
                <span className="italic text-foreground">Discover</span>
                <br />
                <span className="gold-text">Excellence</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground"
              >
                An exclusive selection of premium goods from the world's finest
                brands, curated for the discerning buyer.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Button
                  data-ocid="hero.primary_button"
                  size="lg"
                  className="gold-gradient group border-0 px-8 text-primary-foreground shadow-gold hover:opacity-90"
                  onClick={onShopNow}
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  data-ocid="hero.secondary_button"
                  size="lg"
                  variant="outline"
                  className="border-primary/40 px-8 text-primary hover:border-primary/70 hover:bg-primary/10"
                  onClick={onShopNow}
                >
                  View Collection
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature trust strip */}
      <div className="border-y border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-between">
            {TRUST_SIGNALS.map((signal, i) => (
              <div key={signal} className="flex items-center gap-x-6">
                <span className="feature-strip-item">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {signal}
                </span>
                {i < TRUST_SIGNALS.length - 1 && (
                  <span className="hidden text-border/60 md:block">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
