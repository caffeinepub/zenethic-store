import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  DollarSign,
  Edit2,
  ImageIcon,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  loadGuestOrders,
  updateGuestOrderStatus,
} from "../hooks/useGuestOrders";
import type { GuestOrder } from "../hooks/useGuestOrders";
import {
  useAllOrders,
  useCreateProduct,
  useDeleteProduct,
  useGetUpiId,
  useIsStripeConfigured,
  useProducts,
  useSetStripeConfiguration,
  useSetUpiId,
  useStoreStats,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import { getExtraImages, setExtraImages } from "../utils/imageStorage";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  stock: "",
  isActive: true,
};

const SAMPLE_PRODUCTS = [
  {
    name: "Women's Floral Kurti",
    description:
      "Comfortable and stylish floral print kurti for everyday wear. Available in multiple sizes.",
    price: "12.99",
    category: "Clothing",
    imageUrl: "/assets/generated/product-sweater.dim_600x600.jpg",
    stock: "50",
  },
  {
    name: "Men's Casual Shirt",
    description:
      "Premium cotton casual shirt with slim fit design, perfect for office and casual outings.",
    price: "14.99",
    category: "Clothing",
    imageUrl: "/assets/generated/product-scarf.dim_600x600.jpg",
    stock: "30",
  },
  {
    name: "Gold Plated Necklace Set",
    description:
      "Elegant gold plated necklace with matching earrings. Perfect for weddings and festivals.",
    price: "8.99",
    category: "Jewellery",
    imageUrl: "/assets/generated/product-perfume.dim_600x600.jpg",
    stock: "25",
  },
  {
    name: "Running Sports Shoes",
    description:
      "Lightweight and breathable sports shoes with cushioned sole for daily workouts.",
    price: "24.99",
    category: "Footwear",
    imageUrl: "/assets/generated/product-shoes.dim_600x600.jpg",
    stock: "20",
  },
  {
    name: "Printed Tote Bag",
    description:
      "Spacious printed canvas tote bag with zipper. Great for shopping and daily use.",
    price: "6.99",
    category: "Bags",
    imageUrl: "/assets/generated/product-handbag.dim_600x600.jpg",
    stock: "40",
  },
];

export function AdminDashboard() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();

  const [localGuestOrders, setLocalGuestOrders] = useState<GuestOrder[]>([]);
  useEffect(() => {
    setLocalGuestOrders(loadGuestOrders());
  }, []);

  type DisplayOrder = {
    id: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    totalAmount: number;
    status: string;
    createdAt: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      priceAtPurchase: number;
    }[];
    source: "backend" | "local";
  };

  const backendDisplayOrders: DisplayOrder[] = orders.map((o) => ({
    id: String(o.id),
    customerName: o.customerName ?? "",
    customerPhone: o.customerPhone ?? "",
    shippingAddress: o.shippingAddress ?? "",
    paymentMethod: o.paymentMethod ?? "",
    totalAmount: Number(o.totalAmount),
    status: o.status,
    createdAt: Number(o.createdAt) / 1_000_000,
    items: o.items.map((item) => ({
      productId: String(item.productId),
      productName: "",
      quantity: Number(item.quantity),
      priceAtPurchase: Number(item.priceAtPurchase),
    })),
    source: "backend" as const,
  }));

  const backendIds = new Set(backendDisplayOrders.map((o) => o.id));
  const localOnlyOrders: DisplayOrder[] = localGuestOrders
    .filter((o) => !backendIds.has(o.id))
    .map((o) => ({ ...o, source: "local" as const }));

  const allOrders = [...backendDisplayOrders, ...localOnlyOrders].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  const { data: stats } = useStoreStats();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const setStripeConfig = useSetStripeConfiguration();

  const { data: upiId = "" } = useGetUpiId();
  const setUpiId = useSetUpiId();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [stripeKey, setStripeKey] = useState("");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [samplesOpen, setSamplesOpen] = useState(true);

  const [productImages, setProductImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (dataUrl: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = dataUrl;
    });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        const compressed = await compressImage(dataUrl);
        setProductImages((prev) => {
          if (prev.length >= 4) return prev;
          const next = [...prev, compressed].slice(0, 4);
          setForm((f) => ({ ...f, imageUrl: next[0] }));
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
    // reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setProductImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setForm((f) => ({ ...f, imageUrl: next[0] ?? "" }));
      return next;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const priceNum = Number.parseFloat(form.price);
    if (!form.price || Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Valid price is required");
      return;
    }

    const stockNum = Number.parseInt(form.stock, 10);
    if (!form.stock || Number.isNaN(stockNum) || stockNum < 0) {
      toast.error("Valid stock quantity is required");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      const priceCents = BigInt(Math.round(priceNum * 100));
      const now = BigInt(Date.now()) * 1_000_000n;

      if (editingProduct) {
        await updateProduct.mutateAsync({
          ...editingProduct,
          name: form.name,
          description: form.description,
          price: priceCents,
          category: form.category,
          imageUrl: form.imageUrl,
          stockQuantity: BigInt(stockNum),
          isActive: form.isActive,
        });
        setExtraImages(editingProduct.id, productImages.slice(1));
        toast.success("Product updated");
        setEditingProduct(null);
      } else {
        const newProduct = await createProduct.mutateAsync({
          id: 0n,
          name: form.name,
          description: form.description,
          price: priceCents,
          category: form.category,
          imageUrl: form.imageUrl,
          stockQuantity: BigInt(stockNum),
          isActive: form.isActive,
          createdAt: now,
        });
        if (productImages.length > 1 && newProduct?.id !== undefined) {
          setExtraImages(newProduct.id, productImages.slice(1));
        }
        toast.success("Product created successfully!");
      }
      setForm(EMPTY_FORM);
      setProductImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Product save error:", error);
      let message = "Failed to save product. Please try again.";
      if (error instanceof Error) {
        if (
          error.message.includes("QuotaExceeded") ||
          error.message.includes("storage")
        ) {
          message =
            "Storage full. Please use an image URL instead of uploading.";
        } else {
          message = error.message;
        }
      }
      toast.error(message);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    const extras = getExtraImages(product.id);
    const allImgs = [product.imageUrl, ...extras].filter(Boolean);
    setProductImages(allImgs);
    setForm({
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toFixed(2),
      category: product.category,
      imageUrl: product.imageUrl,
      stock: String(product.stockQuantity),
      isActive: product.isActive,
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProduct.mutateAsync(deleteConfirm.id);
      toast.success("Product deleted");
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Product delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setStripeConfig.mutateAsync({
        secretKey: stripeKey,
        allowedCountries: ["US", "GB", "CA", "AU", "DE", "FR"],
      });
      toast.success("Stripe configured successfully");
      setStripeKey("");
    } catch {
      toast.error("Failed to configure Stripe");
    }
  };

  const applySample = (sample: (typeof SAMPLE_PRODUCTS)[0]) => {
    setEditingProduct(null);
    setProductImages([sample.imageUrl]);
    setForm({ ...sample, isActive: true });
    document
      .getElementById("product-form-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast.success("Store link copied!");
  };

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your Zenethic store
          </p>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6 bg-white border border-gray-200">
            <TabsTrigger
              data-ocid="admin.products_tab"
              value="products"
              className="text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.orders_tab"
              value="orders"
              className="text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.customers_tab"
              value="customers"
              className="text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
            >
              Customers
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.stats_tab"
              value="stats"
              className="text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
            >
              Stats
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.settings_tab"
              value="settings"
              className="text-gray-700 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="space-y-6">
              {/* Quick Add Sample Products */}
              <Collapsible open={samplesOpen} onOpenChange={setSamplesOpen}>
                <div className="rounded-xl border border-amber-200 bg-amber-50">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      data-ocid="admin.samples_toggle"
                      className="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-sm text-gray-900">
                          Quick Add Sample Products
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0 bg-amber-100 text-amber-800"
                        >
                          5 products
                        </Badge>
                      </div>
                      {samplesOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-5">
                      {SAMPLE_PRODUCTS.map((sample, i) => (
                        <div
                          key={sample.name}
                          data-ocid={`admin.sample.card.${i + 1}`}
                          className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
                        >
                          <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={sample.imageUrl}
                              alt={sample.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/assets/generated/product-handbag.dim_600x600.jpg";
                              }}
                            />
                          </div>
                          <p className="mb-0.5 text-xs font-semibold leading-tight line-clamp-2 text-gray-900">
                            {sample.name}
                          </p>
                          <p className="mb-2 text-xs font-bold text-amber-600">
                            ₹{sample.price}
                          </p>
                          <Button
                            data-ocid={`admin.sample.use_button.${i + 1}`}
                            size="sm"
                            className="gold-gradient h-7 w-full border-0 text-xs text-primary-foreground hover:opacity-90"
                            onClick={() => applySample(sample)}
                          >
                            Use This
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Form + Products Table */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Form */}
                <Card
                  id="product-form-card"
                  className="border-gray-200 bg-white shadow-sm"
                >
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="font-display text-lg text-gray-900">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="pname"
                          className="text-gray-800 font-medium"
                        >
                          Product Name
                        </Label>
                        <Input
                          id="pname"
                          data-ocid="admin.product_form.name_input"
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                          placeholder="e.g. Women's Floral Kurti"
                          required
                          className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="pdesc"
                          className="text-gray-800 font-medium"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="pdesc"
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe the product..."
                          rows={2}
                          required
                          className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="pprice"
                            className="text-gray-800 font-medium"
                          >
                            Price (INR)
                          </Label>
                          <Input
                            id="pprice"
                            data-ocid="admin.product_form.price_input"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={form.price}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, price: e.target.value }))
                            }
                            required
                            className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="pstock"
                            className="text-gray-800 font-medium"
                          >
                            Stock
                          </Label>
                          <Input
                            id="pstock"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={form.stock}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, stock: e.target.value }))
                            }
                            required
                            className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="pcat"
                          className="text-gray-800 font-medium"
                        >
                          Category
                        </Label>
                        <Input
                          id="pcat"
                          value={form.category}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, category: e.target.value }))
                          }
                          placeholder="e.g. Clothing"
                          required
                          className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-500"
                        />
                      </div>

                      {/* Image Picker */}
                      <div className="space-y-2">
                        <Label className="text-gray-800 font-medium">
                          Product Images{" "}
                          <span className="text-xs text-gray-400 font-normal">
                            (up to 4)
                          </span>
                        </Label>

                        {/* Hidden file input - multiple */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />

                        {/* Upload button */}
                        {productImages.length < 4 && (
                          <button
                            type="button"
                            data-ocid="admin.product_form.upload_button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition-colors hover:border-gray-400 hover:bg-gray-100"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white">
                              <ImagePlus className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                Upload from Gallery / Album
                              </p>
                              <p className="text-xs text-gray-500">
                                Select up to {4 - productImages.length} more
                                photo
                                {4 - productImages.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </button>
                        )}

                        {/* Image thumbnails grid */}
                        {productImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {productImages.map((img, idx) => (
                              <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: thumbnail grid uses index intentionally
                                key={idx}
                                className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                              >
                                <img
                                  src={img}
                                  alt={`Product view ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                                {idx === 0 && (
                                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                                    Main
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 shadow transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="pactive"
                          checked={form.isActive}
                          onCheckedChange={(v) =>
                            setForm((f) => ({ ...f, isActive: v }))
                          }
                        />
                        <Label htmlFor="pactive" className="text-gray-800">
                          Active (visible in store)
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          data-ocid="admin.product_form.submit_button"
                          type="submit"
                          className="gold-gradient flex-1 border-0 text-primary-foreground hover:opacity-90"
                          disabled={
                            createProduct.isPending || updateProduct.isPending
                          }
                        >
                          {createProduct.isPending ||
                          updateProduct.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : editingProduct ? (
                            "Update Product"
                          ) : (
                            <>
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add Product
                            </>
                          )}
                        </Button>
                        {editingProduct && (
                          <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setEditingProduct(null);
                              setForm(EMPTY_FORM);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Products Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      All Products ({products.length})
                    </h3>
                    <Button
                      data-ocid="admin.add_product_button"
                      size="sm"
                      className="gold-gradient border-0 text-primary-foreground hover:opacity-90"
                      onClick={() => {
                        setEditingProduct(null);
                        setForm(EMPTY_FORM);
                      }}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add New
                    </Button>
                  </div>

                  {productsLoading ? (
                    <div
                      data-ocid="admin.products.loading_state"
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      Loading...
                    </div>
                  ) : products.length === 0 ? (
                    <div
                      data-ocid="admin.products.empty_state"
                      className="rounded-lg border border-gray-200 bg-white py-12 text-center"
                    >
                      <p className="text-sm text-gray-500">
                        No products yet. Use a sample above or add your own!
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 bg-gray-50">
                            <TableHead className="text-gray-700 font-semibold">
                              Name
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Price
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Stock
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Status
                            </TableHead>
                            <TableHead className="text-right text-gray-700 font-semibold">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product, i) => (
                            <TableRow
                              key={String(product.id)}
                              data-ocid={`admin.product.row.${i + 1}`}
                              className="border-gray-100 hover:bg-gray-50"
                            >
                              <TableCell className="max-w-[140px] truncate font-medium text-sm text-gray-900">
                                {product.name}
                              </TableCell>
                              <TableCell className="text-sm text-gray-800">
                                ₹{(Number(product.price) / 100).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-800">
                                {String(product.stockQuantity)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    product.isActive ? "default" : "secondary"
                                  }
                                  className={
                                    product.isActive
                                      ? "gold-gradient border-0 text-primary-foreground"
                                      : "bg-gray-100 text-gray-600"
                                  }
                                >
                                  {product.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    data-ocid={`admin.product.edit_button.${i + 1}`}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    onClick={() => startEdit(product)}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    data-ocid={`admin.product.delete_button.${i + 1}`}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => setDeleteConfirm(product)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="font-display text-lg text-gray-900">
                  All Orders ({allOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {ordersLoading ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    Loading...
                  </div>
                ) : allOrders.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No orders yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold">
                          Order #
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Customer
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Date
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Items
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Total
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Payment
                        </TableHead>
                        <TableHead className="text-gray-700 font-semibold">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allOrders.map((order, i) => (
                        <TableRow
                          key={order.id}
                          data-ocid={`admin.order.row.${i + 1}`}
                          className="border-gray-100 hover:bg-gray-50"
                        >
                          <TableCell className="font-mono text-sm text-gray-800">
                            #{order.id.padStart(6, "0")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.customerName ? (
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {order.customerName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.customerPhone}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-800">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm text-gray-800">
                            {order.items.length}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-gray-900">
                            ₹{(order.totalAmount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {order.paymentMethod ? (
                              <Badge
                                variant="secondary"
                                className={
                                  order.paymentMethod === "cod"
                                    ? "bg-amber-100 text-amber-800"
                                    : order.paymentMethod === "upi"
                                      ? "bg-purple-100 text-purple-800"
                                      : "gold-gradient border-0 text-primary-foreground"
                                }
                              >
                                {order.paymentMethod.toUpperCase()}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(status) => {
                                if (order.source === "local") {
                                  updateGuestOrderStatus(order.id, status);
                                  setLocalGuestOrders(loadGuestOrders());
                                } else {
                                  updateOrderStatus.mutate({
                                    orderId: BigInt(order.id),
                                    status,
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="h-7 w-32 text-xs border-gray-300 bg-white text-gray-800">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem
                                  value="pending"
                                  className="text-gray-800"
                                >
                                  Pending
                                </SelectItem>
                                <SelectItem
                                  value="processing"
                                  className="text-gray-800"
                                >
                                  Processing
                                </SelectItem>
                                <SelectItem
                                  value="shipped"
                                  className="text-gray-800"
                                >
                                  Shipped
                                </SelectItem>
                                <SelectItem
                                  value="delivered"
                                  className="text-gray-800"
                                >
                                  Delivered
                                </SelectItem>
                                <SelectItem
                                  value="cancelled"
                                  className="text-gray-800"
                                >
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" data-ocid="admin.customers_content">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="font-display text-lg text-gray-900">
                  Customer Details ({allOrders.length})
                </CardTitle>
                <p className="text-sm text-gray-500">
                  All customer contact info and addresses for order fulfillment
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {ordersLoading ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    Loading...
                  </div>
                ) : allOrders.length === 0 ? (
                  <div
                    data-ocid="admin.customers_empty_state"
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    No orders yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 bg-gray-50">
                          <TableHead className="text-gray-700 font-semibold">
                            Customer
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Phone
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Delivery Address
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Order #
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Date
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Amount
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Payment
                          </TableHead>
                          <TableHead className="text-gray-700 font-semibold">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allOrders.map((order, i) => (
                          <TableRow
                            key={order.id}
                            data-ocid={`admin.customers.item.${i + 1}`}
                            className="border-gray-100 hover:bg-gray-50"
                          >
                            <TableCell className="font-semibold text-sm text-gray-900">
                              {order.customerName || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-800">
                              {order.customerPhone || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-800 max-w-[200px]">
                              <div
                                className="truncate"
                                title={order.shippingAddress}
                              >
                                {order.shippingAddress || "—"}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-gray-800">
                              #{order.id.padStart(6, "0")}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap text-gray-800">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm font-semibold text-gray-900">
                              ₹{(order.totalAmount / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {order.paymentMethod ? (
                                <Badge
                                  variant="secondary"
                                  className={
                                    order.paymentMethod === "cod"
                                      ? "bg-amber-100 text-amber-800"
                                      : order.paymentMethod === "upi"
                                        ? "bg-purple-100 text-purple-800"
                                        : "gold-gradient border-0 text-primary-foreground"
                                  }
                                >
                                  {order.paymentMethod.toUpperCase()}
                                </Badge>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : order.status === "processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Total Orders",
                  value: stats ? String(stats.totalOrders) : "—",
                  icon: ShoppingBag,
                  desc: "All time",
                },
                {
                  label: "Total Revenue",
                  value: stats
                    ? `₹${(Number(stats.totalRevenue) / 100).toFixed(2)}`
                    : "—",
                  icon: DollarSign,
                  desc: "All time",
                },
                {
                  label: "Total Products",
                  value: stats ? String(stats.productCount) : "—",
                  icon: Package,
                  desc: "In catalog",
                },
                {
                  label: "Active Products",
                  value: stats ? String(stats.activeProductCount) : "—",
                  icon: TrendingUp,
                  desc: "Visible in store",
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="border-gray-200 bg-white shadow-sm"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {stat.label}
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {stat.desc}
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                        <stat.icon className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-4">
              {/* Store Link Card */}
              <Card className="max-w-lg border-gray-200 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="font-display text-lg text-gray-900">
                    Your Store Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="mb-3 text-sm text-gray-600">
                    Share this link with your customers so they can visit your
                    store.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      data-ocid="admin.store_link.input"
                      readOnly
                      value={window.location.origin}
                      className="font-mono text-sm border-gray-300 bg-gray-50 text-gray-800"
                    />
                    <Button
                      data-ocid="admin.store_link.button"
                      type="button"
                      variant="outline"
                      className="shrink-0 border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={handleCopyStoreLink}
                    >
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* UPI ID Card */}
              <Card className="max-w-lg border-gray-200 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="font-display text-lg text-gray-900">
                    UPI ID
                  </CardTitle>
                  {upiId && (
                    <p className="text-sm text-gray-600">
                      Current:{" "}
                      <span className="font-mono font-semibold text-gray-900">
                        {upiId}
                      </span>
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-5">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await setUpiId.mutateAsync(upiIdInput);
                        toast.success("UPI ID saved!");
                        setUpiIdInput("");
                      } catch {
                        toast.error("Failed to save UPI ID");
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="upi-id-input"
                        className="text-gray-800 font-medium"
                      >
                        Your UPI ID
                      </Label>
                      <Input
                        id="upi-id-input"
                        data-ocid="admin.upi_id.input"
                        placeholder="yourname@upi"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        required
                        className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500">
                        Customers will see this ID to send UPI payments.
                      </p>
                    </div>
                    <Button
                      data-ocid="admin.upi_id.save_button"
                      type="submit"
                      className="gold-gradient border-0 text-primary-foreground hover:opacity-90"
                      disabled={setUpiId.isPending}
                    >
                      {setUpiId.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save UPI ID"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Payment Mode Card */}
              <Card className="max-w-lg border-gray-200 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="font-display text-lg text-gray-900">
                    Payment Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                      <CreditCard className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        Stripe
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600">
                        Payments are processed securely via Stripe. Configure
                        your Stripe key below to enable checkout.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe Configuration Card */}
              <Card className="max-w-lg border-gray-200 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="font-display text-lg text-gray-900">
                    Stripe Configuration
                  </CardTitle>
                  {stripeConfigured !== undefined && (
                    <Badge
                      variant={stripeConfigured ? "default" : "secondary"}
                      className={
                        stripeConfigured
                          ? "gold-gradient border-0 text-primary-foreground w-fit"
                          : "w-fit bg-gray-100 text-gray-700"
                      }
                    >
                      {stripeConfigured ? "✓ Configured" : "Not configured"}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-5">
                  <form onSubmit={handleSaveStripe} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="stripe-key"
                        className="text-gray-800 font-medium"
                      >
                        Stripe Secret Key
                      </Label>
                      <Input
                        id="stripe-key"
                        type="password"
                        placeholder="sk_live_... or sk_test_..."
                        value={stripeKey}
                        onChange={(e) => setStripeKey(e.target.value)}
                        required
                        className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500">
                        Your Stripe secret key. Keep this confidential.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="gold-gradient border-0 text-primary-foreground hover:opacity-90"
                      disabled={setStripeConfig.isPending}
                    >
                      {setStripeConfig.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Configuration"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        <Dialog
          open={!!deleteConfirm}
          onOpenChange={(v) => !v && setDeleteConfirm(null)}
        >
          <DialogContent className="border-gray-200 bg-white">
            <DialogHeader>
              <DialogTitle className="font-display text-gray-900">
                Delete Product
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to delete "{deleteConfirm?.name}"? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                data-ocid="admin.delete_button.cancel_button"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="admin.delete_button.confirm_button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
              >
                {deleteProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
