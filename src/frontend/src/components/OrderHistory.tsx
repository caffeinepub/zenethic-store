import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  Loader2,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useUpdateOrderStatus, useUserOrders } from "../hooks/useQueries";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-400" },
  processing: { label: "Processing", icon: Loader2, color: "text-blue-400" },
  shipped: { label: "Shipped", icon: Truck, color: "text-primary" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-destructive" },
};

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3"];

export function OrderHistory() {
  const { data: orders = [], isLoading } = useUserOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const handleCancel = async (orderId: bigint, _index: number) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: "cancelled" });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      toast.success("Order cancelled successfully.");
    } catch {
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="mb-8 font-display text-3xl font-bold">My Orders</h2>
        <div className="space-y-4">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="mb-8 font-display text-3xl font-bold">My Orders</h2>

      {orders.length === 0 ? (
        <div
          data-ocid="orders.empty_state"
          className="flex flex-col items-center justify-center rounded-lg border border-border/50 bg-card py-24 text-center"
        >
          <div className="mb-6 rounded-full border border-primary/20 p-6">
            <Package className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="font-display text-xl font-semibold">No orders yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your order history will appear here
          </p>
        </div>
      ) : (
        <div data-ocid="orders.list" className="space-y-4">
          {orders.map((order, i) => {
            const status = statusConfig[order.status] ?? statusConfig.pending;
            const StatusIcon = status.icon;
            const date = new Date(
              Number(order.createdAt) / 1_000_000,
            ).toLocaleDateString();
            const total = Number(order.totalAmount) / 100;
            const canCancel =
              order.status === "pending" || order.status === "processing";

            return (
              <motion.div
                key={String(order.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Order
                          </span>
                          <span className="font-mono text-sm font-medium">
                            #{String(order.id).padStart(6, "0")}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {date}
                        </p>
                        <p className="mt-2 text-sm">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="gold-text font-display text-xl font-bold">
                          ₹{total.toFixed(2)}
                        </div>
                        <Badge
                          variant="outline"
                          className={`mt-2 flex items-center gap-1 border-current ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    {order.shippingAddress && (
                      <div className="mt-3 border-t border-border/50 pt-3">
                        <p className="text-xs text-muted-foreground">
                          Ships to: {order.shippingAddress}
                        </p>
                      </div>
                    )}
                    {canCancel && (
                      <div className="mt-3 border-t border-border/50 pt-3">
                        <Button
                          data-ocid={`orders.cancel_button.${i + 1}`}
                          variant="outline"
                          size="sm"
                          className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs"
                          onClick={() => handleCancel(order.id, i)}
                          disabled={updateOrderStatus.isPending}
                        >
                          {updateOrderStatus.isPending ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Cancel Order
                            </>
                          )}
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
    </section>
  );
}
