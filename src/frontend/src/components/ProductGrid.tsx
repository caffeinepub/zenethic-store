import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch, Search } from "lucide-react";
import { motion } from "motion/react";
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

interface ProductGridProps {
  sectionTitle?: string;
  sectionBadge?: string;
  filterCategory?: string;
  limit?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showBestSeller?: boolean;
}

export function ProductGrid({
  sectionTitle = "Trending Now",
  sectionBadge = "✦ trending ✦",
  filterCategory,
  limit,
  showSearch = true,
  showFilters = true,
  showBestSeller = false,
}: ProductGridProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(filterCategory ?? "all");
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
    let out = result;
    if (limit) out = out.slice(0, limit);
    return out;
  }, [activeProducts, category, search, limit]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{
              background: "oklch(55% 0.18 15 / 0.1)",
              color: "oklch(45% 0.16 15)",
              border: "1px solid oklch(55% 0.18 15 / 0.2)",
            }}
          >
            {sectionBadge}
          </div>
          <h2 className="section-title">
            {showBestSeller ? (
              <>
                <span style={{ color: "oklch(55% 0.18 15)" }}>
                  Best Sellers
                </span>{" "}
                — Customer Favourites
              </>
            ) : (
              sectionTitle
            )}
          </h2>
        </motion.div>

        {/* Search + filters */}
        {(showSearch || showFilters) && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {showSearch && (
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  data-ocid="products.search_input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="border-border bg-white pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-ocid="products.all.tab"
                  onClick={() => setCategory("all")}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    category === "all"
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-muted-foreground hover:border-primary/60 hover:text-primary"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    data-ocid={`products.${cat}.tab`}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      category === cat
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-muted-foreground hover:border-primary/60 hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div
            data-ocid="products.loading_state"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {SKELETON_KEYS.map((k) => (
              <div key={k} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="products.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <PackageSearch
              className="mb-4 h-14 w-14 text-muted-foreground/40"
              strokeWidth={1}
            />
            <p className="text-base font-semibold text-foreground">
              {search ? "No products match your search" : "No products yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try different keywords"
                : "Add products from the admin panel"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                showBestSeller={showBestSeller}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
