import { Toaster } from "@/components/ui/sonner";
import { Banknote, Package2, RefreshCw, Shield, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminDashboard } from "./components/AdminDashboard";
import { CartDrawer } from "./components/CartDrawer";
import { CategorySection } from "./components/CategorySection";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { LandingPage } from "./components/LandingPage";
import { OrderHistory } from "./components/OrderHistory";
import { ProductGrid } from "./components/ProductGrid";
import { ReturnPolicy } from "./components/ReturnPolicy";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { TrustStrip } from "./components/TrustStrip";
import { useRestoreProducts } from "./hooks/useQueries";

type Page = "shop" | "admin" | "orders" | "policy";

const ADMIN_PIN = "admin2727";

const featureStrip = [
  { icon: Truck, label: "Fast Delivery" },
  { icon: RefreshCw, label: "Easy Returns" },
  { icon: Banknote, label: "COD Available" },
  { icon: Shield, label: "100% Secure Payments" },
  { icon: Package2, label: "Quality Products" },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [page, setPage] = useState<Page>("shop");
  const [cartOpen, setCartOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(
    () => localStorage.getItem("adminPin") === ADMIN_PIN,
  );

  useRestoreProducts();

  // Handle payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast.success("Payment successful! Your order has been placed.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("payment") === "cancel") {
      toast.error("Payment cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Listen for "Buy Now" openCart events from product cards/modals
  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener("openCart", handler);
    return () => window.removeEventListener("openCart", handler);
  }, []);

  const handleAdminUnlock = (pin: string) => {
    if (pin === ADMIN_PIN) {
      localStorage.setItem("adminPin", pin);
      setAdminUnlocked(true);
      setPage("admin");
    }
  };

  const handleAdminLockout = () => {
    localStorage.removeItem("adminPin");
    setAdminUnlocked(false);
    setPage("shop");
  };

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        onCartOpen={() => setCartOpen(true)}
        onAdminClick={() => setPage("admin")}
        onShopClick={() => setPage("shop")}
        onOrdersClick={() => setPage("orders")}
        currentPage={page}
        adminUnlocked={adminUnlocked}
        onAdminUnlock={handleAdminUnlock}
        onAdminLockout={handleAdminLockout}
      />

      <main className="flex-1">
        {page === "shop" && (
          <>
            {/* Hero Banner */}
            <HeroSection
              onShopNow={() =>
                document
                  .getElementById("trending-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            />

            {/* Trust Strip */}
            <TrustStrip />

            {/* Shop by Category */}
            <CategorySection
              onCategoryClick={() => {
                document
                  .getElementById("trending-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Trending Now */}
            <div id="trending-section" className="py-2">
              <ProductGrid
                sectionTitle="Trending Now"
                sectionBadge="✦ trending now ✦"
                showSearch
                showFilters
              />
            </div>

            {/* Best Sellers */}
            <div className="py-2">
              <ProductGrid
                sectionTitle="Best Sellers"
                sectionBadge="🏆 best sellers"
                showSearch={false}
                showFilters={false}
                showBestSeller
                limit={4}
              />
            </div>

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Bottom Feature Strip */}
            <section
              className="border-t border-border py-5"
              style={{ backgroundColor: "oklch(95% 0.003 280)" }}
              aria-label="Store features"
            >
              <div className="container mx-auto px-4">
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                  {featureStrip.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <item.icon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "oklch(50% 0.16 15)" }}
                        strokeWidth={1.8}
                      />
                      <span className="text-xs font-medium text-gray-800">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {page === "admin" && adminUnlocked && <AdminDashboard />}
        {page === "admin" && !adminUnlocked && (
          <div
            data-ocid="admin.error_state"
            className="flex min-h-[60vh] items-center justify-center"
          >
            <div className="text-center">
              <p className="font-medium text-foreground">
                Please enter the admin PIN to continue.
              </p>
            </div>
          </div>
        )}
        {page === "orders" && <OrderHistory />}
        {page === "policy" && <ReturnPolicy onBack={() => setPage("shop")} />}
      </main>

      <Footer onPolicyClick={() => setPage("policy")} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toaster position="top-right" richColors />
    </div>
  );
}
