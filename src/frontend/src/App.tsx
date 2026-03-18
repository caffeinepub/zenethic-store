import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminDashboard } from "./components/AdminDashboard";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { LandingPage } from "./components/LandingPage";
import { OrderHistory } from "./components/OrderHistory";
import { ProductGrid } from "./components/ProductGrid";
import { useRestoreProducts } from "./hooks/useQueries";

type Page = "shop" | "admin" | "orders";

const ADMIN_PIN = "admin2727";

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [page, setPage] = useState<Page>("shop");
  const [cartOpen, setCartOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(
    () => localStorage.getItem("adminPin") === ADMIN_PIN,
  );

  // Restore products from localStorage cache if backend is empty (e.g. after redeployment)
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
    <div className="flex min-h-screen flex-col">
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
            <HeroSection
              onShopNow={() =>
                document
                  .getElementById("shop-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            />
            <div id="shop-section">
              <ProductGrid />
            </div>
          </>
        )}
        {page === "admin" && adminUnlocked && <AdminDashboard />}
        {page === "admin" && !adminUnlocked && (
          <div
            data-ocid="admin.error_state"
            className="flex min-h-[60vh] items-center justify-center"
          >
            <div className="text-center">
              <p className="font-medium">
                Please enter the admin PIN to continue.
              </p>
            </div>
          </div>
        )}
        {page === "orders" && <OrderHistory />}
      </main>

      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toaster position="top-right" richColors />
    </div>
  );
}
