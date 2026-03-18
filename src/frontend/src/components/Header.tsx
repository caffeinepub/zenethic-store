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
  LogIn,
  LogOut,
  Menu,
  Package,
  Phone,
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
      toast.success("Admin access granted!");
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  const handleAdminNavClick = () => {
    if (adminUnlocked) {
      onAdminClick();
    } else {
      setPinDialogOpen(true);
    }
  };

  const handleMobileAdminClick = () => {
    setMobileMenuOpen(false);
    if (adminUnlocked) {
      onAdminClick();
    } else {
      setPinDialogOpen(true);
    }
  };

  const handleLoginSubmit = () => {
    const phone = loginPhone.trim();
    if (!phone || phone.length < 7) {
      setLoginError("Please enter a valid phone number.");
      return;
    }
    customerLogin(phone);
    setLoginDialogOpen(false);
    setLoginPhone("");
    setLoginError("");
    toast.success(`Logged in as ${phone}`);
  };

  const handleCustomerLogout = () => {
    customerLogout();
    toast.success("Logged out successfully.");
  };

  const shortPhone = customerPhone
    ? customerPhone.length > 7
      ? `${customerPhone.slice(0, 3)}···${customerPhone.slice(-3)}`
      : customerPhone
    : null;

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: "oklch(8% 0.008 280 / 0.85)",
          borderBottom: "1px solid oklch(55% 0.23 15 / 0.15)",
        }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <button
            type="button"
            onClick={onShopClick}
            className="flex items-center gap-2 tracking-tight focus:outline-none"
          >
            <img
              src="/assets/generated/zenethic-logo-transparent.dim_400x120.png"
              alt="Zenethic"
              className="h-8 w-auto object-contain"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {[
              {
                label: "Shop",
                page: "shop",
                onClick: onShopClick,
                ocid: "nav.shop_link",
              },
              {
                label: "My Orders",
                page: "orders",
                onClick: onOrdersClick,
                ocid: "nav.orders_link",
              },
            ].map(({ label, page, onClick, ocid }) => (
              <button
                key={page}
                type="button"
                data-ocid={ocid}
                onClick={onClick}
                className="relative text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
                style={{
                  color:
                    currentPage === page
                      ? "oklch(65% 0.22 15)"
                      : "oklch(55% 0.015 280)",
                }}
              >
                {label}
                {currentPage === page && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-px rounded-full"
                    style={{ backgroundColor: "oklch(55% 0.23 15)" }}
                  />
                )}
              </button>
            ))}

            <button
              type="button"
              data-ocid="nav.admin_link"
              onClick={handleAdminNavClick}
              className="relative flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
              style={{
                color:
                  currentPage === "admin"
                    ? "oklch(65% 0.22 15)"
                    : "oklch(55% 0.015 280)",
              }}
            >
              <Crown className="h-3.5 w-3.5" />
              Admin
              {!adminUnlocked && (
                <span className="text-[10px] opacity-50">🔒</span>
              )}
              {currentPage === "admin" && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-px rounded-full"
                  style={{ backgroundColor: "oklch(55% 0.23 15)" }}
                />
              )}
            </button>

            {adminUnlocked && (
              <button
                type="button"
                data-ocid="nav.admin_logout_button"
                onClick={onAdminLockout}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                title="Exit Admin"
              >
                <LogOut className="h-3 w-3" />
                Exit
              </button>
            )}

            {/* Customer Login/User button - Desktop */}
            {customerPhone ? (
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "oklch(55% 0.23 15 / 0.12)",
                    color: "oklch(65% 0.22 15)",
                  }}
                >
                  <User className="h-3 w-3" />
                  {shortPhone}
                </span>
                <button
                  type="button"
                  data-ocid="nav.customer_logout_button"
                  onClick={handleCustomerLogout}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  title="Logout"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="nav.login_button"
                onClick={() => setLoginDialogOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
                style={{
                  border: "1px solid oklch(55% 0.23 15 / 0.4)",
                  color: "oklch(65% 0.22 15)",
                }}
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              data-ocid="nav.cart_button"
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 hover:text-primary"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-0 p-0 text-[10px] font-bold"
                  style={{
                    backgroundColor: "oklch(55% 0.23 15)",
                    color: "oklch(98% 0.003 280)",
                  }}
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  data-ocid="nav.mobile_menu_button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-primary/10 hover:text-primary"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72"
                style={{ backgroundColor: "oklch(10% 0.009 280)" }}
              >
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2 font-display text-lg">
                    <Store
                      className="h-5 w-5"
                      style={{ color: "oklch(55% 0.23 15)" }}
                    />
                    Zenethic
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1">
                  {[
                    {
                      label: "Shop",
                      page: "shop",
                      icon: Store,
                      onClick: () => {
                        setMobileMenuOpen(false);
                        onShopClick();
                      },
                      ocid: "mobile.shop_link",
                    },
                    {
                      label: "My Orders",
                      page: "orders",
                      icon: Package,
                      onClick: () => {
                        setMobileMenuOpen(false);
                        onOrdersClick();
                      },
                      ocid: "mobile.orders_link",
                    },
                  ].map(({ label, page, icon: Icon, onClick, ocid }) => (
                    <button
                      key={page}
                      type="button"
                      data-ocid={ocid}
                      onClick={onClick}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      style={{
                        backgroundColor:
                          currentPage === page
                            ? "oklch(55% 0.23 15 / 0.1)"
                            : "transparent",
                        color:
                          currentPage === page
                            ? "oklch(65% 0.22 15)"
                            : "oklch(80% 0.008 280)",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}

                  <button
                    type="button"
                    data-ocid="mobile.admin_link"
                    onClick={handleMobileAdminClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor:
                        currentPage === "admin"
                          ? "oklch(55% 0.23 15 / 0.1)"
                          : "transparent",
                      color:
                        currentPage === "admin"
                          ? "oklch(65% 0.22 15)"
                          : "oklch(80% 0.008 280)",
                    }}
                  >
                    <Crown className="h-4 w-4" />
                    Admin
                    {!adminUnlocked && (
                      <span className="ml-auto text-[10px] opacity-50">🔒</span>
                    )}
                    {adminUnlocked && (
                      <span
                        className="ml-auto rounded-full px-1.5 py-0.5 text-[10px]"
                        style={{
                          backgroundColor: "oklch(55% 0.23 15 / 0.15)",
                          color: "oklch(65% 0.22 15)",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>

                  {adminUnlocked && (
                    <button
                      type="button"
                      data-ocid="mobile.admin_logout_button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onAdminLockout();
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Exit Admin
                    </button>
                  )}

                  {/* Customer Login/Logout - Mobile */}
                  {customerPhone ? (
                    <>
                      <div
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
                        style={{ color: "oklch(65% 0.22 15)" }}
                      >
                        <User className="h-4 w-4" />
                        {shortPhone}
                      </div>
                      <button
                        type="button"
                        data-ocid="mobile.customer_logout_button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleCustomerLogout();
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      data-ocid="mobile.login_button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginDialogOpen(true);
                      }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: "oklch(65% 0.22 15)" }}
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Admin PIN Dialog */}
      <Dialog
        open={pinDialogOpen}
        onOpenChange={(open) => {
          setPinDialogOpen(open);
          if (!open) {
            setPin("");
            setPinError("");
          }
        }}
      >
        <DialogContent data-ocid="admin.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Crown
                className="h-5 w-5"
                style={{ color: "oklch(55% 0.23 15)" }}
              />
              Admin Access
            </DialogTitle>
            <DialogDescription>
              Enter your admin PIN to access the store control panel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-pin">PIN</Label>
              <Input
                id="admin-pin"
                data-ocid="admin.input"
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                autoFocus
              />
              {pinError && (
                <p
                  data-ocid="admin.error_state"
                  className="text-xs text-destructive"
                >
                  {pinError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              data-ocid="admin.cancel_button"
              variant="outline"
              onClick={() => {
                setPinDialogOpen(false);
                setPin("");
                setPinError("");
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.submit_button"
              className="crimson-gradient border-0"
              style={{ color: "oklch(98% 0.003 280)" }}
              onClick={handlePinSubmit}
              disabled={!pin}
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              Unlock Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Login Dialog */}
      <Dialog
        open={loginDialogOpen}
        onOpenChange={(open) => {
          setLoginDialogOpen(open);
          if (!open) {
            setLoginPhone("");
            setLoginError("");
          }
        }}
      >
        <DialogContent data-ocid="login.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Phone
                className="h-5 w-5"
                style={{ color: "oklch(55% 0.23 15)" }}
              />
              Customer Login
            </DialogTitle>
            <DialogDescription>
              Enter your phone number to view your orders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="login-phone">Phone Number</Label>
              <Input
                id="login-phone"
                data-ocid="login.input"
                type="tel"
                placeholder="e.g. 9876543210"
                value={loginPhone}
                onChange={(e) => {
                  setLoginPhone(e.target.value);
                  setLoginError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
                autoFocus
              />
              {loginError && (
                <p
                  data-ocid="login.error_state"
                  className="text-xs text-destructive"
                >
                  {loginError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              data-ocid="login.cancel_button"
              variant="outline"
              onClick={() => {
                setLoginDialogOpen(false);
                setLoginPhone("");
                setLoginError("");
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="login.submit_button"
              className="crimson-gradient border-0"
              style={{ color: "oklch(98% 0.003 280)" }}
              onClick={handleLoginSubmit}
              disabled={!loginPhone.trim()}
            >
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
