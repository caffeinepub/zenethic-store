import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
  CartItem,
  Order,
  Product,
  ShoppingItem,
  StoreStats,
  StripeConfiguration,
} from "../backend.d";
import { useActor } from "./useActor";

const PRODUCTS_CACHE_KEY = "zenethic_products_v2";
export const CART_CACHE_KEY = "zenethic_cart_v1";

// --- localStorage as primary product store ---

function serializeProduct(p: Product): Record<string, string | boolean> {
  return {
    ...p,
    id: p.id.toString(),
    price: p.price.toString(),
    stockQuantity: p.stockQuantity.toString(),
    createdAt: p.createdAt.toString(),
  };
}

function deserializeProduct(p: Record<string, string | boolean>): Product {
  return {
    ...(p as unknown as Product),
    id: BigInt(p.id as string),
    price: BigInt(p.price as string),
    stockQuantity: BigInt(p.stockQuantity as string),
    createdAt: BigInt(p.createdAt as string),
  };
}

export function loadProductsFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.map(deserializeProduct);
  } catch {
    return [];
  }
}

function saveProductsToStorage(products: Product[]) {
  try {
    localStorage.setItem(
      PRODUCTS_CACHE_KEY,
      JSON.stringify(products.map(serializeProduct)),
    );
  } catch (e) {
    console.error("Failed to save products to storage:", e);
    throw e;
  }
}

function addProductToStorage(product: Product) {
  const existing = loadProductsFromStorage();
  const maxId = existing.reduce((m, p) => (p.id > m ? p.id : m), 0n);
  const newProduct = {
    ...product,
    id: product.id > 0n ? product.id : maxId + 1n,
  };
  saveProductsToStorage([...existing, newProduct]);
  return newProduct;
}

function updateProductInStorage(product: Product) {
  const existing = loadProductsFromStorage();
  saveProductsToStorage(
    existing.map((p) => (p.id === product.id ? product : p)),
  );
}

function removeProductFromStorage(productId: bigint) {
  const existing = loadProductsFromStorage();
  saveProductsToStorage(existing.filter((p) => p.id !== productId));
}

// --- Cart localStorage helpers ---

type LocalCartItem = { productId: bigint; quantity: bigint };

function serializeCartItem(item: LocalCartItem) {
  return {
    productId: item.productId.toString(),
    quantity: item.quantity.toString(),
  };
}
function deserializeCartItem(item: Record<string, string>): LocalCartItem {
  return { productId: BigInt(item.productId), quantity: BigInt(item.quantity) };
}
export function loadCartFromStorage(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(CART_CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map(deserializeCartItem);
  } catch {
    return [];
  }
}
function saveCartToStorage(items: LocalCartItem[]) {
  try {
    localStorage.setItem(
      CART_CACHE_KEY,
      JSON.stringify(items.map(serializeCartItem)),
    );
  } catch {}
}

// --- Hooks ---

// Products: served from localStorage immediately; if localStorage is empty,
// fetch from backend so other phones always see the store.
// Query key includes actor ready state so it re-runs when backend becomes available.
export function useProducts() {
  const { actor, isFetching } = useActor();
  const actorReady = !!actor && !isFetching;
  const queryClient = useQueryClient();

  // Background sync: reconcile localStorage with backend
  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      try {
        const backendProducts = await actor.getProducts();
        const localProducts = loadProductsFromStorage();

        if (
          backendProducts.length >= localProducts.length &&
          backendProducts.length > 0
        ) {
          // Backend has at least as many — trust backend, update local
          saveProductsToStorage(backendProducts);
          queryClient.setQueryData(["products"], backendProducts);
        } else if (localProducts.length > 0 && backendProducts.length === 0) {
          // Backend lost data — push local products to backend
          for (const product of localProducts) {
            try {
              await actor.createProduct({
                ...product,
                id: 0n,
                createdAt: BigInt(Date.now()) * 1_000_000n,
              });
            } catch {}
          }
          const restored = await actor.getProducts();
          if (restored.length > 0) {
            saveProductsToStorage(restored);
          }
          // Update query with local products (synced or not)
          queryClient.setQueryData(["products"], localProducts);
        } else if (localProducts.length > backendProducts.length) {
          // Local has more — push missing products to backend
          const backendIds = new Set(
            backendProducts.map((p) => p.id.toString()),
          );
          const missing = localProducts.filter(
            (p) => !backendIds.has(p.id.toString()),
          );
          for (const product of missing) {
            try {
              await actor.createProduct({
                ...product,
                id: 0n,
                createdAt: BigInt(Date.now()) * 1_000_000n,
              });
            } catch {}
          }
          // Always show local products
          queryClient.setQueryData(["products"], localProducts);
        }
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["storeStats"] });
      } catch (_e) {
        console.error("Product sync failed:", _e);
        // Still show local products even if sync fails
        const localProducts = loadProductsFromStorage();
        if (localProducts.length > 0) {
          queryClient.setQueryData(["products"], localProducts);
        }
      }
    })();
  }, [actor, isFetching, queryClient]);

  return useQuery<Product[]>({
    // Include actorReady so query re-runs when backend becomes available
    queryKey: ["products", actorReady],
    queryFn: async () => {
      // Serve from localStorage immediately if available
      const local = loadProductsFromStorage();
      if (local.length > 0) return local;
      // If localStorage is empty (e.g. customer on another phone), fetch from backend
      if (actor) {
        try {
          const backendProducts = await actor.getProducts();
          if (backendProducts.length > 0) {
            // Cache locally for this session
            saveProductsToStorage(backendProducts);
            return backendProducts;
          }
        } catch {
          // backend not ready yet, return empty
        }
      }
      return [];
    },
    staleTime: 30_000, // 30 seconds - allows refresh to pick up new products
  });
}

// Keep this for compatibility
export function useRestoreProducts() {
  useProducts();
}

export function useCategories() {
  const { actor } = useActor();
  const { data: products } = useProducts();
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const local = products ?? loadProductsFromStorage();
      if (local.length > 0) {
        return [...new Set(local.map((p) => p.category).filter(Boolean))];
      }
      if (!actor) return [];
      try {
        return await actor.getCategories();
      } catch {
        return [];
      }
    },
    enabled: true,
  });
}

// Cart: fully localStorage-based
export function useCart() {
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: () => {
      const items = loadCartFromStorage();
      return items as unknown as CartItem[];
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      const items = loadCartFromStorage();
      const existing = items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        saveCartToStorage(items);
      } else {
        saveCartToStorage([...items, { productId, quantity }]);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      const items = loadCartFromStorage();
      saveCartToStorage(
        items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      const items = loadCartFromStorage();
      saveCartToStorage(items.filter((i) => i.productId !== productId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["userOrders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserOrders();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStoreStats() {
  const { actor, isFetching } = useActor();
  return useQuery<StoreStats>({
    queryKey: ["storeStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalOrders: 0n,
          productCount: 0n,
          activeProductCount: 0n,
          totalRevenue: 0n,
        };
      return actor.getStoreStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUpiId() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["upiId"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getUpiId();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUpiId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.setUpiId(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["upiId"] }),
  });
}

export function usePlaceOrderWithMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      shippingAddress,
      paymentMethod,
      customerName,
      customerPhone,
    }: {
      shippingAddress: string;
      paymentMethod: string;
      customerName: string;
      customerPhone: string;
    }) => {
      if (!actor) {
        console.warn("Backend not ready, skipping order sync");
        return;
      }
      await actor.clearCart();
      const cartItems = loadCartFromStorage();
      await Promise.all(
        cartItems.map((item) => actor.addToCart(item.productId, item.quantity)),
      );
      return actor.placeOrderWithMethod(
        shippingAddress,
        paymentMethod,
        customerName,
        customerPhone,
      );
    },
    onSuccess: () => {
      localStorage.removeItem(CART_CACHE_KEY);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      try {
        const saved = addProductToStorage(product);
        queryClient.setQueryData(["products"], loadProductsFromStorage());
        queryClient.setQueryData(["products", true], loadProductsFromStorage());
        if (actor) {
          actor
            .createProduct({
              ...product,
              id: 0n,
              createdAt: BigInt(Date.now()) * 1_000_000n,
            })
            .catch((e) =>
              console.warn("Backend sync for new product failed:", e),
            );
        }
        return saved;
      } catch (_e) {
        throw new Error(
          "Failed to save product. If you uploaded a large image, try using an image URL instead.",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["storeStats"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      updateProductInStorage(product);
      queryClient.setQueryData(["products"], loadProductsFromStorage());
      queryClient.setQueryData(["products", true], loadProductsFromStorage());
      if (actor) {
        actor
          .updateProduct(product)
          .catch((e) => console.warn("Backend sync for update failed:", e));
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["storeStats"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      removeProductFromStorage(productId);
      queryClient.setQueryData(["products"], loadProductsFromStorage());
      queryClient.setQueryData(["products", true], loadProductsFromStorage());
      if (actor) {
        actor
          .deleteProduct(productId)
          .catch((e) => console.warn("Backend sync for delete failed:", e));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["storeStats"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: string }) => {
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["isStripeConfigured"] }),
  });
}
