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
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section header with gold accent bar */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full gold-gradient" />
            <h2 className="font-display text-3xl font-bold">Our Collection</h2>
          </div>
          <p className="ml-4 text-sm text-muted-foreground">
            Handpicked products from world-class brands
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-ocid="products.search_input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category pill filters */}
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
                className="overflow-hidden rounded-2xl border border-border/40"
              >
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="products.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-6 rounded-full border border-primary/20 p-6 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <PackageSearch className="h-12 w-12 text-primary/60" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-semibold">
              {search || category !== "all"
                ? "No Products Found"
                : "Coming Soon"}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {search || category !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Our curated collection is being assembled. Check back soon for exclusive products."}
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
