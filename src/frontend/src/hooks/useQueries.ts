import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CartItem,
  Order,
  Product,
  ShoppingItem,
  StoreStats,
  StripeConfiguration,
} from "../backend.d";
import { useActor } from "./useActor";

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCart();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
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
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.placeOrderWithMethod(
        shippingAddress,
        paymentMethod,
        customerName,
        customerPhone,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.updateCartQuantity(productId, quantity);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.removeFromCart(productId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) {
        console.error("Actor is null - cannot create product");
        throw new Error("Backend not ready. Please refresh the page.");
      }
      return actor.createProduct(product);
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
      if (!actor) {
        console.error("Actor is null - cannot update product");
        throw new Error("Backend not ready. Please refresh the page.");
      }
      return actor.updateProduct(product);
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
      if (!actor)
        throw new Error("Backend not ready. Please refresh the page.");
      return actor.deleteProduct(productId);
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
