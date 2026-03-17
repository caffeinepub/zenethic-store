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
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
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
  const [imageUrlInput, setImageUrlInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
      setImageUrlInput("");
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImageUrlInput(val);
    setForm((f) => ({ ...f, imageUrl: val }));
  };

  const clearImage = () => {
    setForm((f) => ({ ...f, imageUrl: "" }));
    setImageUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        toast.success("Product updated");
        setEditingProduct(null);
      } else {
        await createProduct.mutateAsync({
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
        toast.success("Product created successfully!");
      }
      setForm(EMPTY_FORM);
      setImageUrlInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Product save error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save product";
      toast.error(message);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    const isDataUrl = product.imageUrl.startsWith("data:");
    setImageUrlInput(isDataUrl ? "" : product.imageUrl);
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
    setImageUrlInput(sample.imageUrl);
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
    <section className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Zenethic store
        </p>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6 border border-border/50 bg-card">
          <TabsTrigger data-ocid="admin.products_tab" value="products">
            Products
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.orders_tab" value="orders">
            Orders
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.stats_tab" value="stats">
            Stats
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.settings_tab" value="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="space-y-6">
            {/* Quick Add Sample Products */}
            <Collapsible open={samplesOpen} onOpenChange={setSamplesOpen}>
              <div className="rounded-xl border border-primary/20 bg-primary/5">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    data-ocid="admin.samples_toggle"
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">
                        Quick Add Sample Products
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                      >
                        5 products
                      </Badge>
                    </div>
                    {samplesOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-5">
                    {SAMPLE_PRODUCTS.map((sample, i) => (
                      <div
                        key={sample.name}
                        data-ocid={`admin.sample.card.${i + 1}`}
                        className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-3 transition-shadow hover:shadow-md"
                      >
                        <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
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
                        <p className="mb-0.5 text-xs font-semibold leading-tight line-clamp-2">
                          {sample.name}
                        </p>
                        <p className="mb-2 text-xs text-primary font-bold">
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
              <Card id="product-form-card" className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pname">Product Name</Label>
                      <Input
                        id="pname"
                        data-ocid="admin.product_form.name_input"
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="e.g. Women's Floral Kurti"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pdesc">Description</Label>
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
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="pprice">Price (INR)</Label>
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
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pstock">Stock</Label>
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
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pcat">Category</Label>
                      <Input
                        id="pcat"
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        placeholder="e.g. Clothing"
                        required
                      />
                    </div>

                    {/* Image Picker */}
                    <div className="space-y-2">
                      <Label>Product Image</Label>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />

                      {/* Upload from gallery button */}
                      <button
                        type="button"
                        data-ocid="admin.product_form.upload_button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/30 px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background">
                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Upload from Gallery / Album
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tap to pick a photo from your device
                          </p>
                        </div>
                      </button>

                      {/* OR divider */}
                      <div className="relative flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          OR
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                      </div>

                      {/* URL input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Or paste image URL
                          </span>
                        </div>
                        <Input
                          id="pimg"
                          data-ocid="admin.product_form.image_url_input"
                          value={imageUrlInput}
                          onChange={handleImageUrlChange}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      {/* Preview */}
                      {form.imageUrl && (
                        <div className="relative mt-1 overflow-hidden rounded-lg border border-border/50 bg-muted/20">
                          <img
                            src={form.imageUrl}
                            alt="Product preview"
                            className="h-36 w-full object-contain p-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                            title="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <p className="pb-1 text-center text-xs text-muted-foreground">
                            Preview
                          </p>
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
                      <Label htmlFor="pactive">Active (visible in store)</Label>
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
                        {createProduct.isPending || updateProduct.isPending ? (
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
                          onClick={() => {
                            setEditingProduct(null);
                            setForm(EMPTY_FORM);
                            setImageUrlInput("");
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
                  <h3 className="font-medium">
                    All Products ({products.length})
                  </h3>
                  <Button
                    data-ocid="admin.add_product_button"
                    size="sm"
                    className="gold-gradient border-0 text-primary-foreground hover:opacity-90"
                    onClick={() => {
                      setEditingProduct(null);
                      setForm(EMPTY_FORM);
                      setImageUrlInput("");
                    }}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add New
                  </Button>
                </div>

                {productsLoading ? (
                  <div
                    data-ocid="admin.products.loading_state"
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </div>
                ) : products.length === 0 ? (
                  <div
                    data-ocid="admin.products.empty_state"
                    className="rounded-lg border border-border/50 bg-card py-12 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      No products yet. Use a sample above or add your own!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product, i) => (
                          <TableRow
                            key={String(product.id)}
                            data-ocid={`admin.product.row.${i + 1}`}
                            className="border-border/50"
                          >
                            <TableCell className="max-w-[140px] truncate font-medium text-sm">
                              {product.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              ₹{(Number(product.price) / 100).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm">
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
                                    : ""
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
                                  className="h-7 w-7 hover:text-primary"
                                  onClick={() => startEdit(product)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  data-ocid={`admin.product.delete_button.${i + 1}`}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:text-destructive"
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
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                All Orders ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No orders yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, i) => (
                      <TableRow
                        key={String(order.id)}
                        data-ocid={`admin.order.row.${i + 1}`}
                        className="border-border/50"
                      >
                        <TableCell className="font-mono text-sm">
                          #{String(order.id).padStart(6, "0")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(
                            Number(order.createdAt) / 1_000_000,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.items.length}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          ₹{(Number(order.totalAmount) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {order.paymentMethod ? (
                            <Badge
                              variant="secondary"
                              className={
                                order.paymentMethod === "cod"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  : order.paymentMethod === "upi"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                    : "gold-gradient border-0 text-primary-foreground"
                              }
                            >
                              {order.paymentMethod.toUpperCase()}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(status) =>
                              updateOrderStatus.mutate({
                                orderId: order.id,
                                status,
                              })
                            }
                          >
                            <SelectTrigger className="h-7 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">
                                Processing
                              </SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">
                                Delivered
                              </SelectItem>
                              <SelectItem value="cancelled">
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
              <Card key={stat.label} className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold gold-text">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {stat.desc}
                      </p>
                    </div>
                    <div className="rounded-lg border border-primary/20 p-2">
                      <stat.icon className="h-5 w-5 text-primary" />
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
            <Card className="max-w-lg border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Your Store Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Share this link with your customers so they can visit your
                  store.
                </p>
                <div className="flex gap-2">
                  <Input
                    data-ocid="admin.store_link.input"
                    readOnly
                    value={window.location.origin}
                    className="font-mono text-sm"
                  />
                  <Button
                    data-ocid="admin.store_link.button"
                    type="button"
                    variant="outline"
                    className="shrink-0 border-primary/40 hover:bg-primary hover:text-primary-foreground"
                    onClick={handleCopyStoreLink}
                  >
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* UPI ID Card */}
            <Card className="max-w-lg border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">UPI ID</CardTitle>
                {upiId && (
                  <p className="text-sm text-muted-foreground">
                    Current:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {upiId}
                    </span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
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
                    <Label htmlFor="upi-id-input">Your UPI ID</Label>
                    <Input
                      id="upi-id-input"
                      data-ocid="admin.upi_id.input"
                      placeholder="yourname@upi"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
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
            <Card className="max-w-lg border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Payment Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Stripe</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Payments are processed securely via Stripe. Configure your
                      Stripe key below to enable checkout.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stripe Configuration Card */}
            <Card className="max-w-lg border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Stripe Configuration
                </CardTitle>
                {stripeConfigured !== undefined && (
                  <Badge
                    variant={stripeConfigured ? "default" : "secondary"}
                    className={
                      stripeConfigured
                        ? "gold-gradient border-0 text-primary-foreground w-fit"
                        : "w-fit"
                    }
                  >
                    {stripeConfigured ? "✓ Configured" : "Not configured"}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveStripe} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                    <Input
                      id="stripe-key"
                      type="password"
                      placeholder="sk_live_... or sk_test_..."
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
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

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(v) => !v && setDeleteConfirm(null)}
      >
        <DialogContent className="border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              data-ocid="admin.delete_button.cancel_button"
              variant="outline"
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
