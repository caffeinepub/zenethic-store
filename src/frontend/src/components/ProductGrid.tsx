import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useCategories, useProducts } from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
];

export function ProductGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive),
    [products],
  );

  const filtered = useMemo(() => {
    let result = activeProducts;
    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [activeProducts, category, search]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Gen Z heading */}
        <div className="mb-6 text-center">
          <div
            className="mb-2 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest"
            style={{
              background: "oklch(55% 0.23 15 / 0.15)",
              color: "oklch(65% 0.23 15)",
              border: "1px solid oklch(55% 0.23 15 / 0.3)",
            }}
          >
            ✦ trending now ✦
          </div>
          <h1
            className="font-display text-5xl font-black leading-none tracking-tight md:text-7xl lg:text-8xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(75% 0.23 15) 0%, oklch(55% 0.23 15) 40%, oklch(80% 0.15 30) 70%, oklch(60% 0.25 10) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px oklch(55% 0.23 15 / 0.4))",
            }}
          >
            Gen Z Products
          </h1>
          <p
            className="mt-3 text-sm font-medium tracking-wider"
            style={{ color: "oklch(65% 0.015 280)" }}
          >
            no cap, these hits different 🔥
          </p>
        </div>

        {/* Editorial section header */}
        <div className="relative mb-12 flex items-end gap-4">
          <span className="editorial-number leading-none">01</span>
          <div className="mb-1">
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: "oklch(55% 0.23 15)" }}
            >
              Handpicked For You
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Our Collection
            </h2>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "oklch(55% 0.015 280)" }}
            />
            <Input
              data-ocid="products.search_input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border bg-card pl-9 focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-ocid="products.category_filter.tab"
              className={`category-pill${category === "all" ? " active" : ""}`}
              onClick={() => setCategory("all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`category-pill${category === cat ? " active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: "oklch(20% 0.015 280)" }}
              >
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="products.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div
              className="mb-6 rounded-2xl p-8"
              style={{
                backgroundColor: "oklch(55% 0.23 15 / 0.06)",
                border: "1px solid oklch(55% 0.23 15 / 0.2)",
              }}
            >
              <PackageSearch
                className="h-12 w-12"
                style={{ color: "oklch(55% 0.23 15 / 0.6)" }}
              />
            </div>
            <h3 className="mb-2 font-display text-2xl font-semibold">
              {search || category !== "all"
                ? "No Products Found"
                : "Coming Soon"}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {search || category !== "all"
                ? "Try adjusting your search or filter."
                : "Our curated collection is being assembled. Check back soon."}
            </p>
          </div>
        ) : (
          <div
            data-ocid="products.list"
            className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4"
          >
            {filtered.map((product, index) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
