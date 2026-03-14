import { Sparkles } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="mt-16 border-t border-border/50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src="/assets/generated/zenethic-logo-transparent.dim_400x120.png"
            alt="Zenethic"
            className="h-8 w-auto object-contain opacity-70"
          />
          <p className="text-xs text-muted-foreground max-w-xs">
            Curated quality products from the world's finest brands, delivered
            to your door.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>© {year} Zenethic. Built with</span>
            <Sparkles className="h-3 w-3 text-primary" />
            <span>using</span>
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
