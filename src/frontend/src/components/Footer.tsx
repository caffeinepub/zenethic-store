import { Heart } from "lucide-react";

function FooterLink({ label }: { label: string }) {
  return (
    <li>
      <button
        type="button"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.color = "oklch(65% 0.22 15)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.color = "";
        }}
      >
        {label}
      </button>
    </li>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer
      className="relative mt-20 overflow-hidden"
      style={{
        backgroundColor: "oklch(10% 0.009 280)",
        borderTop: "1px solid oklch(55% 0.23 15 / 0.15)",
      }}
    >
      {/* Watermark text */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-display select-none font-extrabold uppercase"
          style={{
            fontSize: "clamp(5rem, 20vw, 16rem)",
            color: "oklch(95% 0.005 280 / 0.03)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          ZENETHIC
        </span>
      </div>

      <div className="relative container mx-auto px-4">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-3">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <img
              src="/assets/generated/zenethic-logo-transparent.dim_400x120.png"
              alt="Zenethic"
              className="h-8 w-auto object-contain opacity-70"
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium dropshipping &amp; reselling platform. Curated products
              from the world&apos;s finest brands, delivered to your door.
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: "oklch(55% 0.23 15 / 0.08)",
                color: "oklch(65% 0.22 15)",
                border: "1px solid oklch(55% 0.23 15 / 0.2)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "oklch(55% 0.23 15)" }}
              />
              INR ₹ Currency Supported
            </div>
          </div>

          {/* Shop links */}
          <div className="flex flex-col gap-4">
            <h4
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "oklch(65% 0.22 15)" }}
            >
              Shop
            </h4>
            <ul className="flex flex-col gap-2.5">
              {["All Products", "New Arrivals", "My Orders", "Track Order"].map(
                (link) => (
                  <FooterLink key={link} label={link} />
                ),
              )}
            </ul>
          </div>

          {/* Info links */}
          <div className="flex flex-col gap-4">
            <h4
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "oklch(65% 0.22 15)" }}
            >
              Info
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                "About Zenethic",
                "Shipping Policy",
                "Returns & Refunds",
                "Contact Us",
              ].map((link) => (
                <FooterLink key={link} label={link} />
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground md:flex-row"
          style={{ borderTop: "1px solid oklch(20% 0.015 280)" }}
        >
          <span>© {year} Zenethic. All rights reserved.</span>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart
              className="h-3 w-3"
              style={{
                fill: "oklch(55% 0.23 15)",
                color: "oklch(55% 0.23 15)",
              }}
            />
            <span>using</span>
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: "oklch(65% 0.22 15)" }}
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
