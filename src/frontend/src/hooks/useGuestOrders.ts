// Guest order storage in localStorage

const GUEST_ORDERS_KEY = "zenethic_guest_orders_v1";

export interface GuestOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number; // in paise (price * quantity)
}

export interface GuestOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: GuestOrderItem[];
  totalAmount: number; // in paise
  status: string;
  createdAt: number; // ms timestamp
}

export function loadGuestOrders(): GuestOrder[] {
  try {
    const raw = localStorage.getItem(GUEST_ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveGuestOrder(order: GuestOrder) {
  const orders = loadGuestOrders();
  orders.unshift(order); // newest first
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(orders));
}

export function updateGuestOrderStatus(id: string, status: string) {
  const orders = loadGuestOrders();
  const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(updated));
}

export function generateOrderId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
