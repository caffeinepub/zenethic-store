import { Heart, ShoppingBag } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="mt-16 border-t border-primary/20 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-3">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <img
              src="/assets/generated/zenethic-logo-transparent.dim_400x120.png"
              alt="Zenethic"
              className="h-8 w-auto object-contain opacity-80"
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Curated quality products from the world's finest brands, delivered
              to your door.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <ShoppingBag className="h-3.5 w-3.5 text-primary/60" />
              <span>Dropshipping &amp; Reselling Platform</span>
            </div>
          </div>

          {/* Shop links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Shop
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  My Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  Track Order
                </button>
              </li>
            </ul>
          </div>

          {/* Info links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Info
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  About Zenethic
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  Returns &amp; Refunds
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/30 py-5 text-xs text-muted-foreground md:flex-row">
          <span>© {year} Zenethic. All rights reserved.</span>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart className="h-3 w-3 fill-primary text-primary" />
            <span>using</span>
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
