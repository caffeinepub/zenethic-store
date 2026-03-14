import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StoreStats {
    totalOrders: bigint;
    productCount: bigint;
    activeProductCount: bigint;
    totalRevenue: bigint;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    priceAtPurchase: bigint;
}
export interface Order {
    id: bigint;
    status: string;
    userId: Principal;
    createdAt: bigint;
    totalAmount: bigint;
    shippingAddress: string;
    items: Array<OrderItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Product {
    id: bigint;
    stockQuantity: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProduct(product: Product): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCart(): Promise<Array<CartItem>>;
    getCategories(): Promise<Array<string>>;
    getProducts(): Promise<Array<Product>>;
    getStoreStats(): Promise<StoreStats>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserOrders(): Promise<Array<Order>>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(shippingAddress: string): Promise<void>;
    removeFromCart(productId: bigint): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCartQuantity(productId: bigint, quantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
