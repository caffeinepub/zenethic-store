import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  Loader2,
  LogIn,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type GuestOrder,
  loadGuestOrders,
  updateGuestOrderStatus,
} from "../hooks/useGuestOrders";

const CUSTOMER_PHONE_KEY = "zenethic_customer_phone";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600" },
  processing: { label: "Processing", icon: Loader2, color: "text-blue-600" },
  shipped: { label: "Shipped", icon: Truck, color: "text-indigo-600" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600" },
};

const paymentMethodLabel: Record<string, string> = {
  cod: "COD",
  upi: "UPI",
  stripe: "Stripe",
};

export function OrderHistory() {
  const customerPhone = localStorage.getItem(CUSTOMER_PHONE_KEY);
  const [allOrders, setAllOrders] = useState<GuestOrder[]>(() =>
    loadGuestOrders(),
  );

  const orders = customerPhone
    ? allOrders.filter((o) => o.customerPhone === customerPhone)
    : allOrders;

  const handleRefresh = () => {
    setAllOrders(loadGuestOrders());
    toast.success("Orders refreshed");
  };

  const handleCancel = (orderId: string) => {
    updateGuestOrderStatus(orderId, "cancelled");
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)),
    );
    toast.success("Order cancelled successfully.");
  };

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-900">
              My Orders
            </h2>
            {customerPhone && (
              <p className="mt-1 text-sm text-gray-600">
                Showing orders for{" "}
                <span className="font-semibold text-red-600">
                  {customerPhone}
                </span>
              </p>
            )}
          </div>
          <Button
            data-ocid="orders.secondary_button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {!customerPhone && allOrders.length === 0 ? (
          <div
            data-ocid="orders.empty_state"
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-24 text-center"
          >
            <div className="mb-6 rounded-full border border-gray-200 p-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-900">
              No orders yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Place an order to see your order history here
            </p>
          </div>
        ) : customerPhone && orders.length === 0 ? (
          <div
            data-ocid="orders.empty_state"
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-24 text-center"
          >
            <div className="mb-6 rounded-full border border-gray-200 p-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-900">
              No orders found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              No orders placed with this phone number yet
            </p>
          </div>
        ) : !customerPhone && allOrders.length > 0 ? (
          <div
            data-ocid="orders.empty_state"
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center"
          >
            <div className="mb-6 rounded-full border border-gray-200 p-6">
              <LogIn className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-900">
              Login to view your orders
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Click the <strong className="text-gray-800">Login</strong> button
              in the top navigation and enter your phone number to see your
              orders.
            </p>
          </div>
        ) : (
          <div data-ocid="orders.list" className="space-y-4">
            {orders.map((order, i) => {
              const status = statusConfig[order.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              const date = new Date(order.createdAt).toLocaleDateString();
              const total = order.totalAmount / 100;
              const canCancel =
                order.status === "pending" || order.status === "processing";
              const pmLabel =
                paymentMethodLabel[order.paymentMethod] ??
                order.paymentMethod.toUpperCase();

              return (
                <motion.div
                  key={order.id}
                  data-ocid={`orders.item.${i + 1}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Order</span>
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              #{order.id.slice(-8)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{date}</p>
                          {order.customerName && (
                            <p className="mt-1 text-sm font-semibold text-gray-800">
                              {order.customerName}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-gray-700">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-xl font-bold text-gray-900">
                            ₹{total.toFixed(2)}
                          </div>
                          <Badge
                            variant="outline"
                            className={`mt-2 flex items-center gap-1 border-current text-xs font-semibold ${status.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="mt-1 flex items-center gap-1 border-gray-300 text-gray-700 text-xs"
                          >
                            {pmLabel}
                          </Badge>
                        </div>
                      </div>
                      {order.shippingAddress && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-600">
                            Ships to: {order.shippingAddress}
                          </p>
                        </div>
                      )}
                      {order.items.length > 0 && (
                        <div className="mt-2">
                          {order.items.map((item) => (
                            <p
                              key={item.productId}
                              className="text-xs text-gray-600"
                            >
                              {item.productName} × {item.quantity}
                            </p>
                          ))}
                        </div>
                      )}
                      {canCancel && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <Button
                            data-ocid={`orders.cancel_button.${i + 1}`}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                            onClick={() => handleCancel(order.id)}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Cancel Order
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
