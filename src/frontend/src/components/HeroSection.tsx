import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onShopNow: () => void;
}

export function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-[500px] w-full">
        <img
          src="/assets/generated/zenethic-hero-banner.dim_1400x500.jpg"
          alt="Zenethic — Curated Quality"
          className="h-full w-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-4 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Premium Collection
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-4 font-display text-5xl font-bold leading-tight md:text-6xl"
              >
                Curated <span className="gold-text italic">Quality,</span>
                <br />
                Delivered
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-8 text-base text-muted-foreground"
              >
                Discover an exclusive selection of premium goods from the
                world's finest brands, all under one roof.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Button
                  data-ocid="hero.primary_button"
                  size="lg"
                  className="gold-gradient group border-0 px-8 text-primary-foreground hover:opacity-90"
                  onClick={onShopNow}
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
