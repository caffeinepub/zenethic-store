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
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCart } from "../hooks/useQueries";

interface HeaderProps {
  onCartOpen: () => void;
  onAdminClick: () => void;
  onShopClick: () => void;
  onOrdersClick: () => void;
  currentPage: string;
  isLoggedIn: boolean;
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
  isLoggedIn,
  adminUnlocked,
  onAdminUnlock,
  onAdminLockout,
}: HeaderProps) {
  const { data: cartItems = [] } = useCart();
  const { login, clear, loginStatus } = useInternetIdentity();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/90 backdrop-blur-md">
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
          <nav className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              data-ocid="nav.shop_link"
              onClick={onShopClick}
              className={`relative text-sm font-semibold tracking-wide transition-colors hover:text-primary ${
                currentPage === "shop"
                  ? "text-primary after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:content-['']"
                  : "text-muted-foreground"
              }`}
            >
              Shop
            </button>
            {isLoggedIn && (
              <button
                type="button"
                data-ocid="nav.orders_link"
                onClick={onOrdersClick}
                className={`relative text-sm font-semibold tracking-wide transition-colors hover:text-primary ${
                  currentPage === "orders"
                    ? "text-primary after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:content-['']"
                    : "text-muted-foreground"
                }`}
              >
                My Orders
              </button>
            )}
            <button
              type="button"
              data-ocid="nav.admin_link"
              onClick={handleAdminNavClick}
              className={`relative flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors hover:text-primary ${
                currentPage === "admin"
                  ? "text-primary after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:content-['']"
                  : "text-muted-foreground"
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              Admin
              {!adminUnlocked && (
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  🔒
                </span>
              )}
            </button>
            {adminUnlocked && (
              <button
                type="button"
                data-ocid="nav.admin_logout_button"
                onClick={onAdminLockout}
                className="flex items-center gap-1 text-xs text-muted-foreground/60 transition-colors hover:text-destructive"
                title="Exit Admin"
              >
                <LogOut className="h-3 w-3" />
                Exit Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              data-ocid="nav.cart_button"
              variant="ghost"
              size="icon"
              className="relative hover:text-primary"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="gold-gradient absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-0 p-0 text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {isLoggedIn ? (
              <div className="hidden items-center gap-2 md:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary"
                  onClick={() => onOrdersClick()}
                  title="My Orders"
                >
                  <Package className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-destructive"
                  onClick={() => clear()}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                data-ocid="nav.login_button"
                variant="outline"
                size="sm"
                className="hidden border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground md:flex"
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
              >
                <User className="mr-1.5 h-3.5 w-3.5" />
                {loginStatus === "logging-in" ? "Connecting..." : "Login"}
              </Button>
            )}

            {/* Mobile Hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  data-ocid="nav.mobile_menu_button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Zenethic
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1">
                  <button
                    type="button"
                    data-ocid="mobile.shop_link"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onShopClick();
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                      currentPage === "shop"
                        ? "bg-muted text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    Shop
                  </button>

                  <button
                    type="button"
                    data-ocid="mobile.orders_link"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOrdersClick();
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                      currentPage === "orders"
                        ? "bg-muted text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </button>

                  <button
                    type="button"
                    data-ocid="mobile.admin_link"
                    onClick={handleMobileAdminClick}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                      currentPage === "admin"
                        ? "bg-muted text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    Admin
                    {!adminUnlocked && (
                      <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        🔒
                      </span>
                    )}
                    {adminUnlocked && (
                      <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
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
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Exit Admin
                    </button>
                  )}
                </nav>

                <div className="mt-6 border-t border-border pt-6">
                  {isLoggedIn ? (
                    <Button
                      variant="outline"
                      className="w-full hover:text-destructive"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        clear();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <Button
                      data-ocid="mobile.login_button"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        login();
                      }}
                      disabled={loginStatus === "logging-in"}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {loginStatus === "logging-in" ? "Connecting..." : "Login"}
                    </Button>
                  )}
                </div>
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
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
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
              onClick={handlePinSubmit}
              disabled={!pin}
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              Unlock Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
