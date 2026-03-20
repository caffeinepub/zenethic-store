import { Heart, Instagram, MessageCircle, Twitter } from "lucide-react";

function FooterLink({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
      </button>
    </li>
  );
}

interface FooterProps {
  onPolicyClick?: () => void;
}

export function Footer({ onPolicyClick }: FooterProps) {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-white">
      {/* Bottom trust strip */}
      <div style={{ backgroundColor: "oklch(97% 0.015 15)" }}>
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            {[
              { emoji: "🚚", label: "Fast Delivery" },
              { emoji: "↩️", label: "Easy Returns" },
              { emoji: "💵", label: "COD Available" },
              { emoji: "🔒", label: "100% Secure" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-semibold text-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div
              className="font-display text-2xl font-extrabold"
              style={{ color: "oklch(55% 0.18 15)" }}
            >
              Zenethic
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Premium perfumes, skincare & aesthetic accessories. Your vibe,
              your store.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/919405923854"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
              Shop
            </h4>
            <ul className="flex flex-col gap-2.5">
              <FooterLink label="Fragrance" />
              <FooterLink label="Skincare" />
              <FooterLink label="Aesthetic Accessories" />
              <FooterLink label="Best Sellers" />
              <FooterLink label="New Arrivals" />
            </ul>
          </div>

          {/* Policies column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
              Policies
            </h4>
            <ul className="flex flex-col gap-2.5">
              <FooterLink label="Returns & Refunds" onClick={onPolicyClick} />
              <FooterLink label="Privacy Policy" />
              <FooterLink label="Terms of Service" />
              <FooterLink label="Shipping Policy" />
            </ul>
          </div>

          {/* Contact column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
              Contact Us
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://wa.me/919405923854"
                  className="transition-colors hover:text-foreground"
                >
                  📱 9405923854
                </a>
              </li>
              <li className="text-xs">UPI: shreyashgaonkar85@okicici</li>
              <li className="text-xs">Mon–Sat, 10am–7pm</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} Zenethic. All rights reserved.</p>
          <p>
            Built with <Heart className="inline h-3 w-3 text-primary" /> using{" "}
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
