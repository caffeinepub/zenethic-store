import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Crown,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../hooks/useQueries";

const CUSTOMER_PHONE_KEY = "zenethic_customer_phone";

export function useCustomerAuth() {
  const [customerPhone, setCustomerPhone] = useState<string | null>(() =>
    localStorage.getItem(CUSTOMER_PHONE_KEY),
  );

  const login = (phone: string) => {
    localStorage.setItem(CUSTOMER_PHONE_KEY, phone);
    setCustomerPhone(phone);
  };

  const logout = () => {
    localStorage.removeItem(CUSTOMER_PHONE_KEY);
    setCustomerPhone(null);
  };

  return { customerPhone, login, logout };
}

interface HeaderProps {
  onCartOpen: () => void;
  onAdminClick: () => void;
  onShopClick: () => void;
  onOrdersClick: () => void;
  currentPage: string;
  adminUnlocked?: boolean;
  onAdminUnlock: (pin: string) => void;
  onAdminLockout: () => void;
}

export function Header({
  onCartOpen,
  onAdminClick,
  onShopClick,
  onOrdersClick,
  currentPage,
  adminUnlocked,
  onAdminUnlock,
  onAdminLockout,
}: HeaderProps) {
  const { data: cartItems = [] } = useCart();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginError, setLoginError] = useState("");
  const {
    customerPhone,
    login: customerLogin,
    logout: customerLogout,
  } = useCustomerAuth();

  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );

  const handlePinSubmit = () => {
    if (pin === "admin2727") {
      onAdminUnlock(pin);
      setPinDialogOpen(false);
      setPin("");
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  const handleLoginSubmit = () => {
    if (loginPhone.replace(/\D/g, "").length >= 10) {
      customerLogin(loginPhone);
      setLoginDialogOpen(false);
      setLoginPhone("");
      setLoginError("");
      toast.success("Logged in successfully!");
    } else {
      setLoginError("Please enter a valid 10-digit phone number.");
    }
  };

  const navLinks = [
    { label: "Fragrance", category: "fragrance" },
    { label: "Skincare", category: "skincare" },
    { label: "Accessories", category: "accessories" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      <div className="announcement-bar py-2 text-center text-xs font-semibold tracking-wide">
        🎉 Mega Sale! Up to 50% Off &nbsp;|&nbsp; Free Shipping on Orders Over
        ₹499
      </div>

      {/* Main Header */}
      <div className="border-b border-border bg-white shadow-xs">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <button
            type="button"
            data-ocid="header.logo.link"
            onClick={onShopClick}
            className="flex items-center gap-2"
          >
            <span
              className="font-display text-2xl font-extrabold tracking-tight"
              style={{ color: "oklch(55% 0.18 15)" }}
            >
              Zenethic
            </span>
          </button>

          {/* Desktop Nav */}
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            <button
              type="button"
              data-ocid="nav.shop.link"
              onClick={onShopClick}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === "shop" ? "text-primary" : "text-foreground"
              }`}
            >
              Home
            </button>
            {navLinks.map((link) => (
              <button
                key={link.category}
                type="button"
                data-ocid={`nav.${link.category}.link`}
                onClick={onShopClick}
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              data-ocid="nav.orders.link"
              onClick={onOrdersClick}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === "orders" ? "text-primary" : "text-foreground"
              }`}
            >
              Contact Us
            </button>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Search icon (decorative) */}
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>

            {/* Cart */}
            <button
              type="button"
              data-ocid="header.cart.button"
              onClick={onCartOpen}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: "oklch(55% 0.18 15)" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Login / Profile */}
            {customerPhone ? (
              <button
                type="button"
                data-ocid="header.profile.button"
                onClick={customerLogout}
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent md:flex"
                title={`Logged in: ${customerPhone}`}
              >
                <User className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                data-ocid="header.login.button"
                onClick={() => setLoginDialogOpen(true)}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/60 hover:text-primary md:flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </button>
            )}

            {/* Admin icon */}
            {adminUnlocked ? (
              <button
                type="button"
                data-ocid="header.admin.button"
                onClick={onAdminClick}
                className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 md:flex rose-gradient"
              >
                <Crown className="h-3.5 w-3.5" />
                Admin
              </button>
            ) : (
              <button
                type="button"
                data-ocid="header.admin_unlock.button"
                onClick={() => setPinDialogOpen(true)}
                className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
                aria-label="Admin"
              >
                <Crown className="h-4 w-4" />
              </button>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  data-ocid="header.mobile_menu.button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 border-l border-border bg-white"
                data-ocid="header.mobile_menu.sheet"
              >
                <SheetHeader>
                  <SheetTitle
                    className="font-display text-xl"
                    style={{ color: "oklch(55% 0.18 15)" }}
                  >
                    Zenethic
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onShopClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Store className="h-4 w-4 text-primary" />
                    Shop
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOrdersClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Package className="h-4 w-4 text-primary" />
                    My Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onCartOpen();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Cart
                    {cartCount > 0 && (
                      <Badge className="ml-auto text-white rose-gradient border-0">
                        {cartCount}
                      </Badge>
                    )}
                  </button>
                  {customerPhone ? (
                    <button
                      type="button"
                      onClick={() => {
                        customerLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4 text-primary" />
                      Logout ({customerPhone})
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginDialogOpen(true);
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <LogIn className="h-4 w-4 text-primary" />
                      Login
                    </button>
                  )}
                  <div className="my-2 border-t border-border" />
                  {adminUnlocked ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onAdminClick();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white rose-gradient transition-opacity hover:opacity-90"
                      >
                        <Crown className="h-4 w-4" />
                        Admin Panel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAdminLockout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Lock Admin
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setPinDialogOpen(true);
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                    >
                      <Crown className="h-4 w-4" />
                      Admin Login
                    </button>
                  )}
                </nav>

                <div className="absolute bottom-6 left-0 right-0 px-4">
                  <p className="text-center text-xs text-muted-foreground">
                    📞 9405923854
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Admin PIN Dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent
          data-ocid="admin.pin.dialog"
          className="border-border bg-white"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Admin Access
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your admin PIN to access the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="admin-pin" className="text-foreground">
              PIN
            </Label>
            <Input
              id="admin-pin"
              data-ocid="admin.pin.input"
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              className="border-border bg-white text-foreground placeholder:text-muted-foreground"
            />
            {pinError && (
              <p
                data-ocid="admin.pin.error_state"
                className="text-sm text-destructive"
              >
                {pinError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="admin.pin.cancel_button"
              onClick={() => {
                setPinDialogOpen(false);
                setPin("");
                setPinError("");
              }}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.pin.submit_button"
              onClick={handlePinSubmit}
              className="text-white rose-gradient border-0 hover:opacity-90"
            >
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent
          data-ocid="login.dialog"
          className="border-border bg-white"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Customer Login
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your phone number to track your orders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="login-phone" className="text-foreground">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <div className="flex h-9 items-center justify-center rounded-md border border-border bg-secondary px-3 text-sm font-medium text-foreground">
                <Phone className="mr-1.5 h-3.5 w-3.5" /> +91
              </div>
              <Input
                id="login-phone"
                data-ocid="login.phone.input"
                type="tel"
                placeholder="10-digit phone number"
                value={loginPhone}
                onChange={(e) => {
                  setLoginPhone(e.target.value);
                  setLoginError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
                className="border-border bg-white text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {loginError && (
              <p
                data-ocid="login.error_state"
                className="text-sm text-destructive"
              >
                {loginError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="login.cancel_button"
              onClick={() => {
                setLoginDialogOpen(false);
                setLoginPhone("");
                setLoginError("");
              }}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="login.submit_button"
              onClick={handleLoginSubmit}
              className="text-white rose-gradient border-0 hover:opacity-90"
            >
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
