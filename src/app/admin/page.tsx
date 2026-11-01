"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Product, Order, Category } from "@/types";
import { formatGhs } from "@/lib/paystack";
import {
  Shield,
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories" | "new-product">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataLoadError, setDataLoadError] = useState("");

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    scentNotes: "FLORAL & AMBER",
    description: "",
    price: "",
    originalPrice: "",
    stock: "15",
    size: "",
    categoryId: "cat-fresh",
    image: "",
    images: [] as string[],
    isFeatured: false,
    isGiftSet: false,
    isSale: false,
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState("10");
  const [discountScope, setDiscountScope] = useState<"selected" | "all">("selected");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    scentNotes: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    size: "",
    categoryId: "",
    isFeatured: false,
    isGiftSet: false,
    isSale: false,
  });

  const fetchData = async () => {
    setIsDataLoading(true);
    setDataLoadError("");
    const loadErrors: string[] = [];
    try {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      } else {
        const data = await ordersRes.json().catch(() => ({}));
        loadErrors.push(data.error || "Saved orders could not be loaded.");
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      } else {
        const data = await productsRes.json().catch(() => ({}));
        loadErrors.push(data.error || "Saved products could not be loaded.");
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        const loadedCategories: Category[] = data.categories || [];
        setCategories(loadedCategories);
        setNewProduct((current) => ({
          ...current,
          categoryId: loadedCategories.some((category) => category.id === current.categoryId)
            ? current.categoryId
            : loadedCategories[0]?.id || "",
        }));
      } else {
        loadErrors.push("Product categories could not be loaded.");
      }

      if (loadErrors.length) {
        setDataLoadError(loadErrors.join(" "));
      }
    } catch (error) {
      console.error("Admin dashboard data request failed:", error);
      setDataLoadError("The admin dashboard could not contact the server. Check the development terminal for the database error, then try Refresh.");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (requestedTab === "orders" || requestedTab === "products" || requestedTab === "categories" || requestedTab === "new-product") setActiveTab(requestedTab);
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setStatusMessage(`Order updated to ${newStatus}`);
        setTimeout(() => setStatusMessage(""), 3000);
        fetchData();
      }
    } catch {
      // error
    }
  };

  const handleProductImageUpload = async (files?: FileList | File[]) => {
    const selectedFiles = files ? Array.from(files) : [];
    if (!selectedFiles.length) return;
    setUploadingProductImage(true);
    setStatusMessage("");
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok || typeof data.url !== "string") throw new Error(data.error || `Could not upload ${file.name}`);
        uploadedUrls.push(data.url);
      }
      setNewProduct((current) => ({
        ...current,
        image: current.images.length === 0 ? uploadedUrls[0] : current.image,
        images: [...current.images, ...uploadedUrls],
      }));
      setStatusMessage(`${uploadedUrls.length} product photo${uploadedUrls.length === 1 ? "" : "s"} uploaded. Save the fragrance to keep them.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleAddProductPhotos = async (product: Product, files?: FileList | File[]) => {
    const selectedFiles = files ? Array.from(files) : [];
    if (!selectedFiles.length) return;
    setUploadingProductId(product.id);
    setStatusMessage("");
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/admin/media", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok || typeof data.url !== "string") throw new Error(data.error || `Could not upload ${file.name}`);
        uploadedUrls.push(data.url);
      }
      const existingImages = product.images || [];
      const allImages = [...new Set([...existingImages, product.image, ...uploadedUrls].filter((url) => Boolean(url) && !url.startsWith("/images/products/")))];
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, images: allImages }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Photos uploaded, but the product could not be updated.");
      setStatusMessage(`Added ${uploadedUrls.length} photo${uploadedUrls.length === 1 ? "" : "s"} to ${product.name}.`);
      await fetchData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not add product photos.");
    } finally {
      setUploadingProductId(null);
    }
  };

  const handleReplaceProductImage = async (product: Product, file?: File) => {
    if (!file) return;
    setUploadingProductId(product.id);
    setStatusMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok || typeof uploadData.url !== "string") {
        throw new Error(uploadData.error || "Image upload failed.");
      }

      const updateResponse = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, image: uploadData.url }),
      });
      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || "The image uploaded, but the product could not be updated.");
      }

      setStatusMessage(`Image updated for ${product.name}.`);
      await fetchData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not replace product image.");
    } finally {
      setUploadingProductId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName, description: newCategoryDescription }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create category.");
      const createdCategory: Category = data.category;
      setCategories((current) => [...current, createdCategory].sort((a, b) => a.name.localeCompare(b.name)));
      setNewProduct((current) => ({ ...current, categoryId: current.categoryId || createdCategory.id }));
      setNewCategoryName("");
      setNewCategoryDescription("");
      setStatusMessage(`Category "${createdCategory.name}" added successfully.`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not create category.");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        setStatusMessage("New product created successfully!");
        setNewProduct({
          name: "",
          scentNotes: "FLORAL & AMBER",
          description: "",
          price: "",
          originalPrice: "",
          stock: "15",
          size: "",
          categoryId: categories[0]?.id || "",
          image: "",
          images: [],
          isFeatured: false,
          isGiftSet: false,
          isSale: false,
        });
        setActiveTab("products");
        fetchData();
        await fetchData();
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusMessage(data.error || "Could not create product. Check the database connection.");
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not create product.");
    }
  };

  const startEditingProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProduct({
      name: product.name || "",
      scentNotes: product.scentNotes || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      originalPrice: product.originalPrice == null ? "" : String(product.originalPrice),
      stock: String(product.stock ?? 0),
      size: product.size || "",
      categoryId: product.categoryId || "",
      isFeatured: !!product.isFeatured,
      isGiftSet: !!product.isGiftSet,
      isSale: !!product.isSale,
    });
    setStatusMessage("");
  };

  const handleSaveProductEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setStatusMessage("");
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          ...editProduct,
          price: Number(editProduct.price),
          originalPrice: editProduct.originalPrice.trim() === "" ? null : Number(editProduct.originalPrice),
          stock: Number(editProduct.stock),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update product.");
      setEditingProduct(null);
      setStatusMessage(`“${editProduct.name}” updated successfully.`);
      await fetchData();
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not update product.");
    }
  };

  const handleBulkDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const percent = Number(discountPercent);
    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
      setStatusMessage("Enter a discount percentage greater than 0 and less than 100.");
      return;
    }
    const productIds = discountScope === "all" ? products.map((product) => product.id) : selectedProductIds;
    if (productIds.length === 0) {
      setStatusMessage("Select at least one product, or choose all products.");
      return;
    }
    if (!confirm(`Apply a ${percent}% discount to ${productIds.length} product(s)?`)) return;
    setIsApplyingDiscount(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk-discount", productIds, percent }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not apply the discount.");
      setStatusMessage(`${percent}% discount applied to ${data.updatedCount} product(s).`);
      setSelectedProductIds([]);
      await fetchData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not apply the discount.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveBulkDiscount = async () => {
    const productIds = discountScope === "all" ? products.map((product) => product.id) : selectedProductIds;
    if (productIds.length === 0) {
      setStatusMessage("Select at least one product, or choose all products.");
      return;
    }
    if (!confirm(`Remove discounts from ${productIds.length} product(s) and restore their original prices?`)) return;
    setIsApplyingDiscount(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove-bulk-discount", productIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not remove discounts.");
      setStatusMessage(`Discount removed from ${data.updatedCount} product(s).`);
      setSelectedProductIds([]);
      await fetchData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not remove discounts.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this perfume?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setStatusMessage("Product deleted successfully.");
        await fetchData();
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusMessage(data.error || "Could not delete product.");
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not delete product.");
    }
  };

  const handleStockUpdate = async (product: Product, delta: number) => {
    const updatedStock = Math.max(0, product.stock + delta);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, stock: updatedStock }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // error
    }
  };

  // KPI Computations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "SUCCESS" || o.status === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const paidOrdersCount = orders.filter(
    (o) => o.paymentStatus === "SUCCESS" || o.status === "PAID"
  ).length;

  const lowStockCount = products.filter((p) => p.stock < 5).length;

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-[#EFE9E2] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1917] text-[#DFC07D] flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C827A] block">
                MANAGEMENT CONSOLE
              </span>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#1C1917]">
                Aura &amp; Aether <span className="italic font-serif-luxury">Admin Portal.</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="px-3.5 py-2 rounded-full border border-[#D5CDC4] text-xs font-semibold text-[#5C554F] hover:bg-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link href="/admin/content" className="px-4 py-2 rounded-full border border-[#D9A17E] text-[#5C554F] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors">Edit Storefront</Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-full bg-[#17110F] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#38332E] transition-colors"
            >
              View Live Store
            </Link>
          </div>
        </div>

        {dataLoadError && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            <strong className="block mb-1">Some admin data could not be loaded.</strong>
            <span>{dataLoadError}</span>
            <button type="button" onClick={fetchData} className="ml-2 underline font-semibold">Try again</button>
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Top KPIs Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl border border-[#ECE5DD] p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] block mb-1">
              Confirmed Revenue
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#1C1917]">
                {formatGhs(totalRevenue)}
              </span>
              <DollarSign className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ECE5DD] p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] block mb-1">
              Paid Orders
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#1C1917]">{paidOrdersCount}</span>
              <ShoppingCart className="w-5 h-5 text-[#C59B4B]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ECE5DD] p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] block mb-1">
              Active Products
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#1C1917]">{products.length}</span>
              <Package className="w-5 h-5 text-[#3B82F6]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#ECE5DD] p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] block mb-1">
              Low Stock Warnings
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#DC2626]">{lowStockCount}</span>
              <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div id="admin-tabs" className="flex items-center gap-2 border-b border-[#EFE9E2] mb-8 pb-3">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "orders"
                ? "bg-[#1C1917] text-white"
                : "text-[#5C554F] hover:bg-[#F2ECE4]"
            }`}
          >
            Orders &amp; Fulfillment ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "products"
                ? "bg-[#1C1917] text-white"
                : "text-[#5C554F] hover:bg-[#F2ECE4]"
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "categories"
                ? "bg-[#1C1917] text-white"
                : "text-[#5C554F] hover:bg-[#F2ECE4]"
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("new-product")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              activeTab === "new-product"
                ? "bg-[#1C1917] text-white"
                : "text-[#5C554F] hover:bg-[#F2ECE4]"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Fragrance</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#1C1917]">
                Customer Orders &amp; Paystack Transactions
              </h2>
            </div>

            {orders.length === 0 ? (
              <p className="text-center py-16 text-xs text-[#78716C]">No orders placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F4] text-[#78716C] uppercase font-bold text-[10px] tracking-wider border-b border-[#EFE9E2]">
                    <tr>
                      <th className="py-3 px-4">Order / Date</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Delivery City</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Paystack Ref</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFEB]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FCFAF7] transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-bold text-[#1C1917]">{o.orderNumber}</span>
                          <span className="block text-[10px] text-[#8C827A]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-[#1C1917]">{o.customerName}</span>
                          <span className="block text-[10px] text-[#8C827A]">{o.customerPhone}</span>
                        </td>
                        <td className="py-4 px-4 text-[#5C554F]">{o.city}</td>
                        <td className="py-4 px-4 font-bold text-[#1C1917]">
                          {formatGhs(o.totalAmount)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-[10px] bg-[#F5EFEB] px-2 py-0.5 rounded text-[#4A443F]">
                            {o.paymentReference}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(o.id, e.target.value as Order["status"])
                            }
                            className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                              o.status === "PAID"
                                ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                                : o.status === "SHIPPED"
                                ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
                                : o.status === "DELIVERED"
                                ? "bg-[#F3E8FF] border-[#DDD6FE] text-[#6B21A8]"
                                : "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]"
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 shadow-2xs">
            <h2 className="font-serif-luxury text-xl font-semibold text-[#1C1917] mb-6">
              Product &amp; Inventory Management
            </h2>

            <form onSubmit={handleBulkDiscount} className="mb-6 rounded-2xl border border-[#E7D8BC] bg-[#FCFAF6] p-5">
              <div className="mb-4">
                <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917]">Bulk Discounts</h3>
                <p className="mt-1 text-xs text-[#78716C]">Apply one percentage discount to selected fragrances or your entire catalog. Original prices are saved so discounts won't compound.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Apply discount to</label>
                  <select value={discountScope} onChange={(e) => setDiscountScope(e.target.value as "selected" | "all")} className="w-full rounded-xl border border-[#DDD6CD] bg-white px-3 py-2.5 text-sm text-[#1C1917]">
                    <option value="selected">Selected products ({selectedProductIds.length})</option>
                    <option value="all">All products ({products.length})</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Discount percentage (%)</label>
                  <input type="number" min="1" max="99" step="1" required value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="w-full rounded-xl border border-[#DDD6CD] bg-white px-3 py-2.5 text-sm text-[#1C1917]" />
                </div>
                <button type="submit" disabled={isApplyingDiscount || products.length === 0} className="rounded-full bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#38332E] disabled:opacity-50">
                  {isApplyingDiscount ? "Applying..." : "Apply Discount"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-[#78716C]">Select products using the checkboxes in the catalog below.</p>
                <button type="button" onClick={handleRemoveBulkDiscount} disabled={isApplyingDiscount || products.length === 0} className="rounded-full border border-[#C8B8A4] px-4 py-2 text-[11px] font-semibold text-[#5C554F] hover:bg-white disabled:opacity-50">Remove discounts / restore original prices</button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F4] text-[#78716C] uppercase font-bold text-[10px] tracking-wider border-b border-[#EFE9E2]">
                  <tr>
                    <th className="py-3 px-4">
                      <input aria-label="Select all products" type="checkbox" checked={products.length > 0 && products.every((product) => selectedProductIds.includes(product.id))} onChange={(e) => setSelectedProductIds(e.target.checked ? products.map((product) => product.id) : [])} />
                    </th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Scent Notes</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Quantity</th>
                    <th className="py-3 px-4">Flags</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4">
                        <input aria-label={`Select ${p.name}`} type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={(e) => setSelectedProductIds((current) => e.target.checked ? [...current, p.id] : current.filter((id) => id !== p.id))} />
                      </td>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-10 h-12 bg-[#FAF7F4] rounded relative overflow-hidden shrink-0 border border-[#EDE7DF]">
                          {(p.images?.find((url) => typeof url === "string" && url.trim() && !url.startsWith("/images/products/")) || (p.image?.trim() && !p.image.startsWith("/images/products/") ? p.image : "")) ? (
                            <Image
                              src={p.images?.find((url) => typeof url === "string" && url.trim() && !url.startsWith("/images/products/")) || (p.image?.trim() && !p.image.startsWith("/images/products/") ? p.image : "")}
                              alt={p.name}
                              fill
                              className="object-contain p-0.5"
                            />
                          ) : null}
                        </div>
                        <div>
                          <span className="font-bold text-[#1C1917]">{p.name}</span>
                          <span className="block text-[10px] text-[#8C827A]">{p.size}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] uppercase tracking-wider text-[#78716C]">
                        {p.scentNotes}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#1C1917]">{formatGhs(p.price)}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="block text-[10px] text-[#A89F95] line-through">{formatGhs(p.originalPrice)}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockUpdate(p, -1)}
                            className="w-6 h-6 rounded bg-[#F5EFEB] hover:bg-[#EBE3D9] flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span
                            className={`font-semibold ${
                              p.stock < 5 ? "text-[#DC2626]" : "text-[#1C1917]"
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleStockUpdate(p, 1)}
                            className="w-6 h-6 rounded bg-[#F5EFEB] hover:bg-[#EBE3D9] flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {p.isFeatured && (
                            <span className="bg-[#1C1917] text-white text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Featured
                            </span>
                          )}
                          {p.isSale && (
                            <span className="bg-[#DFC07D] text-[#1C1917] text-[9px] px-2 py-0.5 rounded-full uppercase font-bold">
                              Sale
                            </span>
                          )}
                          {p.isGiftSet && (
                            <span className="bg-[#4B5945] text-white text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Coffret
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <label
                            className={`inline-flex items-center gap-1.5 rounded-full border border-[#DDD6CD] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5C554F] hover:bg-[#FAF7F4] cursor-pointer transition-colors ${uploadingProductId === p.id ? "opacity-50 pointer-events-none" : ""}`}
                            title={`Change image for ${p.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{uploadingProductId === p.id ? "Uploading…" : "Change image"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                              disabled={uploadingProductId !== null}
                              className="hidden"
                              onChange={(e) => {
                                void handleReplaceProductImage(p, e.currentTarget.files?.[0]);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                          <label className={`inline-flex items-center gap-1.5 rounded-full border border-[#DDD6CD] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5C554F] hover:bg-[#FAF7F4] cursor-pointer transition-colors ${uploadingProductId === p.id ? "opacity-50 pointer-events-none" : ""}`} title={`Add photos for ${p.name}`}>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{uploadingProductId === p.id ? "Uploading…" : "Add photos"}</span>
                            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={uploadingProductId !== null} className="hidden" onChange={(e) => { void handleAddProductPhotos(p, e.currentTarget.files || undefined); e.currentTarget.value = ""; }} />
                          </label>
                          <button
                            onClick={() => startEditingProduct(p)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6CD] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5C554F] hover:bg-[#FAF7F4] transition-colors"
                            title={`Edit ${p.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-[#A89F95] hover:text-[#DC2626] transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
            <div className="my-auto w-full max-w-2xl rounded-3xl border border-[#ECE5DD] bg-white p-6 shadow-2xl sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C827A]">Product catalog</p>
                  <h2 className="mt-1 font-serif-luxury text-2xl font-semibold text-[#1C1917]">Edit Fragrance</h2>
                  <p className="mt-1 text-xs text-[#78716C]">Update the details or change the selling price and discount for this existing product.</p>
                </div>
                <button type="button" onClick={() => setEditingProduct(null)} className="rounded-full border border-[#DDD6CD] px-3 py-1.5 text-xs font-semibold text-[#5C554F] hover:bg-[#FAF7F4]">Close</button>
              </div>
              <form onSubmit={handleSaveProductEdits} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Perfume Name *</label>
                  <input required value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Current Selling Price (GH₵) *</label>
                    <input required type="number" min="0.01" step="0.01" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Original Price Before Discount (GH₵)</label>
                    <input type="number" min="0" step="0.01" placeholder="Leave blank if not discounted" value={editProduct.originalPrice} onChange={(e) => setEditProduct({ ...editProduct, originalPrice: e.target.value })} className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]" />
                    <p className="mt-1 text-[11px] text-[#8C827A]">The original price must be higher than the selling price. Clear this field to remove the discount display.</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Perfume Size *</label>
                    <input required value={editProduct.size} onChange={(e) => setEditProduct({ ...editProduct, size: e.target.value })} placeholder="e.g. 30ml, 50ml, 100ml" className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Stock Quantity *</label>
                    <input required type="number" min="0" step="1" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })} className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Category *</label>
                  <select required value={editProduct.categoryId} onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })} className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]">
                    <option value="" disabled>Choose a category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Scent Profile Descriptor</label>
                  <input value={editProduct.scentNotes} onChange={(e) => setEditProduct({ ...editProduct, scentNotes: e.target.value })} className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Description *</label>
                  <textarea required rows={4} value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} className="w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-2.5 text-sm text-[#1C1917]" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[#4A443F]"><input type="checkbox" checked={editProduct.isFeatured} onChange={(e) => setEditProduct({ ...editProduct, isFeatured: e.target.checked })} /> Mark as Featured</label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[#4A443F]"><input type="checkbox" checked={editProduct.isSale} onChange={(e) => setEditProduct({ ...editProduct, isSale: e.target.checked })} /> Mark On Sale</label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-[#4A443F]"><input type="checkbox" checked={editProduct.isGiftSet} onChange={(e) => setEditProduct({ ...editProduct, isGiftSet: e.target.checked })} /> Is Gift Set / Coffret</label>
                </div>
                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button type="button" onClick={() => setEditingProduct(null)} className="w-full rounded-full border border-[#DDD6CD] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#5C554F] hover:bg-[#FAF7F4]">Cancel</button>
                  <button type="submit" className="w-full rounded-full bg-[#1C1917] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#FAF8F5] hover:bg-[#38332E]">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories management */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-8 shadow-2xs">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#1C1917] mb-2">Add a Category</h2>
              <p className="text-xs text-[#78716C] mb-6">Create categories to organise fragrances in your shop.</p>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">Category name *</label>
                  <input required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Vanilla & Gourmand" className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">Description (optional)</label>
                  <textarea rows={3} value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} placeholder="What defines this fragrance category?" className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]" />
                </div>
                <button type="submit" className="w-full py-3 px-6 rounded-full bg-[#1C1917] text-[#FAF8F5] text-xs font-bold uppercase tracking-widest hover:bg-[#38332E] transition-colors">Save Category</button>
              </form>
            </div>
            <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-8 shadow-2xs">
              <h2 className="font-serif-luxury text-xl font-semibold text-[#1C1917] mb-6">Available Categories</h2>
              {categories.length === 0 ? (
                <p className="text-sm text-[#78716C]">No categories found. Refresh to try again.</p>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-xl border border-[#ECE5DD] p-4">
                      <p className="text-sm font-semibold text-[#1C1917]">{category.name}</p>
                      {category.description && <p className="mt-1 text-xs text-[#78716C]">{category.description}</p>}
                      <p className="mt-2 text-[10px] uppercase tracking-wider text-[#A89F95]">{category.slug}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Create Product Form */}
        {activeTab === "new-product" && (
          <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-10 shadow-2xs max-w-2xl">
            <h2 className="font-serif-luxury text-2xl font-semibold text-[#1C1917] mb-6">
              Add New Fragrance to Catalog
            </h2>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="border border-dashed border-[#DDD6CD] rounded-xl p-4 bg-[#FFFCFA]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-2">Product photos (optional)</label>
                <p className="text-xs text-[#78716C] mb-3">Upload one or several JPG, PNG, WebP, GIF or AVIF photos (max 10 MB each). You can skip this and use the default image.</p>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={uploadingProductImage} onChange={(e) => { void handleProductImageUpload(e.currentTarget.files || undefined); e.currentTarget.value = ""; }} className="block w-full text-xs file:mr-3 file:border-0 file:bg-[#1C1917] file:px-3 file:py-2 file:text-white" />
                {uploadingProductImage && <p className="mt-2 text-xs text-[#8B6658]">Uploading photos…</p>}
                <p className="mt-2 break-all text-[11px] text-[#78716C]">Main photo: {newProduct.image}</p>
                {newProduct.images.length > 0 && <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">{newProduct.images.map((url, index) => <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-[#EDE7DF] bg-white"><Image src={url} alt={`Product photo ${index + 1}`} fill className="object-contain p-1" /><button type="button" onClick={() => setNewProduct((current) => { const images = current.images.filter((_, i) => i !== index); return { ...current, images, image: images[0] || "" }; })} className="absolute right-1 top-1 rounded bg-white/90 px-1.5 py-1 text-[10px] font-bold text-[#9B2C2C]">Remove</button></div>)}</div>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                  Perfume Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber Bloom"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                    Current Selling Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="480.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                    Original Price Before Discount (GH₵)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 550.00 (leave blank if no discount)"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                  />
                  <p className="mt-1 text-[11px] text-[#8C827A]">If entered above the current selling price, the old price will appear crossed out on the storefront.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                    Initial Stock Count *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                  Perfume Size *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30ml, 50ml, 100ml"
                  value={newProduct.size}
                  onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                  className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                  Category *
                </label>
                <select
                  required
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                >
                  <option value="" disabled>Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {categories.length === 0 && <p className="mt-1 text-xs text-[#B91C1C]">No categories are available. Add one in the Categories tab first.</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                  Scent Profile Descriptor (e.g. BREEZY &amp; JOYFUL)
                </label>
                <input
                  type="text"
                  placeholder="WARM OUD & SPICED RESINS"
                  value={newProduct.scentNotes}
                  onChange={(e) => setNewProduct({ ...newProduct, scentNotes: e.target.value })}
                  className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A443F] mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Artisanal olfactory storytelling..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-[#FAF7F4] border border-[#DDD6CD] rounded-xl px-4 py-2.5 text-sm text-[#1C1917]"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-[#4A443F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isFeatured}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, isFeatured: e.target.checked })
                    }
                    className="rounded border-[#DDD6CD]"
                  />
                  <span>Mark as Featured</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#4A443F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isSale}
                    onChange={(e) => setNewProduct({ ...newProduct, isSale: e.target.checked })}
                    className="rounded border-[#DDD6CD]"
                  />
                  <span>Mark On Sale</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#4A443F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isGiftSet}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, isGiftSet: e.target.checked })
                    }
                    className="rounded border-[#DDD6CD]"
                  />
                  <span>Is Gift Set / Coffret</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-full bg-[#1C1917] text-[#FAF8F5] text-xs font-bold uppercase tracking-widest hover:bg-[#38332E] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>Save and Publish Fragrance</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
