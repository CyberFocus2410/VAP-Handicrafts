/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/money";
import { AdminNav } from "./AdminNav";
import { CmsProduct, CmsCategory } from "@/server/admin/cms-service";
import { compressImageForUpload, fileToDataUrl } from "@/lib/images/client-compress";

interface AdminProductsViewProps {
  initialProducts: CmsProduct[];
  categories: CmsCategory[];
}

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({
  initialProducts,
  categories,
}) => {
  const [products, setProducts] = useState<CmsProduct[]>(initialProducts);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Product Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>("");
  const [formCategorySlug, setFormCategorySlug] = useState<string>("shell-jewellery");
  const [formPriceRupees, setFormPriceRupees] = useState<string>("499");
  const [formCompareRupees, setFormCompareRupees] = useState<string>("699");
  const [formStock, setFormStock] = useState<string>("10");
  const [formFulfilment, setFormFulfilment] = useState<"in_stock" | "made_to_order">("in_stock");
  const [formMaterials, setFormMaterials] = useState<string>("Natural Cowrie Shells, 18k Gold-tone links");
  const [formDimensions, setFormDimensions] = useState<string>("Adjustable 16cm - 21cm");
  const [formImages, setFormImages] = useState<string[]>([
    "/images/products/golden-link-cowrie-charm-bracelet.webp",
  ]);
  const [formImageUrlInput, setFormImageUrlInput] = useState<string>("");
  const [editImageUrlInput, setEditImageUrlInput] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<CmsProduct | null>(null);
  const [editPriceRupees, setEditPriceRupees] = useState<string>("");
  const [editCompareRupees, setEditCompareRupees] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const startEditingProduct = (p: CmsProduct) => {
    setEditingProduct({ ...p });
    setEditPriceRupees(String(p.priceMinor / 100));
    setEditCompareRupees(p.compareAtPriceMinor ? String(p.compareAtPriceMinor / 100) : "");
  };

  // Image Upload & Resolve State
  const [isUploadingAddImage, setIsUploadingAddImage] = useState<boolean>(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState<boolean>(false);

  // Quick Action Notification
  const [notification, setNotification] = useState<string>("");

  const handleFileUpload = async (files: FileList | File[], target: "add" | "edit") => {
    const isAdd = target === "add";
    if (isAdd) setIsUploadingAddImage(true);
    else setIsUploadingEditImage(true);

    const fileArray = Array.from(files);
    if (fileArray.length === 0) {
      if (isAdd) setIsUploadingAddImage(false);
      else setIsUploadingEditImage(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (const rawFile of fileArray) {
        // Automatically optimize/compress oversized camera photos (e.g. 5-15MB -> ~250KB WebP)
        const file = await compressImageForUpload(rawFile);

        let finalUrl: string | null = null;

        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/admin/cms/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json().catch(() => null);
          if (res.ok && data?.success && data?.url) {
            finalUrl = data.url;
          }
        } catch (uploadFetchErr) {
          console.warn("[CMS Upload] Server fetch notice, utilizing local fallback:", uploadFetchErr);
        }

        // Resilient fallback: If server upload or network had an issue, convert to local Data URL
        if (!finalUrl) {
          finalUrl = await fileToDataUrl(file);
        }

        if (finalUrl) {
          uploadedUrls.push(finalUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        if (isAdd) {
          setFormImages((prev) => [...prev, ...uploadedUrls]);
        } else {
          setEditingProduct((prev) => {
            if (!prev) return null;
            const current =
              prev.images && prev.images.length > 0
                ? prev.images
                : [prev.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp"];
            const updated = [...current, ...uploadedUrls];
            return {
              ...prev,
              images: updated,
              imageUrl: updated[0] || prev.imageUrl,
            };
          });
        }
        setNotification(
          `${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} uploaded & attached successfully!`
        );
        setTimeout(() => setNotification(""), 3500);
      } else {
        alert("Failed to process image(s). Please try selecting another photo.");
      }
    } catch (err: unknown) {
      console.error("Image upload exception:", err);
      // Emergency fallback for first file so merchant is never blocked
      try {
        const emergencyDataUrl = await fileToDataUrl(fileArray[0]!);
        if (isAdd) {
          setFormImages((prev) => [...prev, emergencyDataUrl]);
        }
        setNotification("Photo attached successfully!");
        setTimeout(() => setNotification(""), 3500);
      } catch {
        const msg = err instanceof Error ? err.message : "Network error during image upload";
        alert(`Failed to upload photo: ${msg}`);
      }
    } finally {
      if (isAdd) setIsUploadingAddImage(false);
      else setIsUploadingEditImage(false);
    }
  };

  const handleAddUrl = async (rawUrl: string, target: "add" | "edit") => {
    if (!rawUrl.trim()) return;
    const isAdd = target === "add";
    if (isAdd) setIsUploadingAddImage(true);
    else setIsUploadingEditImage(true);

    try {
      const res = await fetch("/api/admin/cms/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl.trim() }),
      });
      const data = await res.json();
      const finalUrl = data.success && data.url ? data.url : rawUrl.trim();

      if (isAdd) {
        setFormImages((prev) => [...prev, finalUrl]);
        setFormImageUrlInput("");
      } else {
        setEditingProduct((prev) => {
          if (!prev) return null;
          const current =
            prev.images && prev.images.length > 0
              ? prev.images
              : [prev.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp"];
          const updated = [...current, finalUrl];
          return {
            ...prev,
            images: updated,
            imageUrl: updated[0] || prev.imageUrl,
          };
        });
        setEditImageUrlInput("");
      }
      setNotification("Image URL added & attached!");
      setTimeout(() => setNotification(""), 3500);
    } catch {
      alert("Failed to add image link");
    } finally {
      if (isAdd) setIsUploadingAddImage(false);
      else setIsUploadingEditImage(false);
    }
  };

  const handleSetPrimaryImage = (index: number, target: "add" | "edit") => {
    if (target === "add") {
      setFormImages((prev) => {
        const item = prev[index];
        if (!item) return prev;
        const rest = prev.filter((_, i) => i !== index);
        return [item, ...rest];
      });
    } else {
      setEditingProduct((prev) => {
        if (!prev) return null;
        const current =
          prev.images && prev.images.length > 0
            ? prev.images
            : [prev.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp"];
        const item = current[index];
        if (!item) return prev;
        const rest = current.filter((_, i) => i !== index);
        const updated = [item, ...rest];
        return {
          ...prev,
          images: updated,
          imageUrl: updated[0] || prev.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp",
        };
      });
    }
  };

  const handleRemoveImage = (index: number, target: "add" | "edit") => {
    if (target === "add") {
      if (formImages.length <= 1) {
        alert("Each product must have at least one image.");
        return;
      }
      setFormImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditingProduct((prev) => {
        if (!prev) return null;
        const current =
          prev.images && prev.images.length > 0
            ? prev.images
            : [prev.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp"];
        if (current.length <= 1) {
          alert("Each product must have at least one image.");
          return prev;
        }
        const updated = current.filter((_, i) => i !== index);
        return {
          ...prev,
          images: updated,
          imageUrl: updated[0] || prev.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp",
        };
      });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      categoryFilter === "all" || p.categorySlug === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.materials.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleToggleStatus = async (product: CmsProduct) => {
    const nextStatus = product.status === "active" ? "draft" : "active";
    try {
      const res = await fetch("/api/admin/cms/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: product.id,
          patch: { status: nextStatus },
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
        setNotification(`Product status updated to ${nextStatus}!`);
        setTimeout(() => setNotification(""), 3000);
      }
    } catch {
      alert("Failed to toggle status");
    }
  };

  const handleUpdateStock = async (product: CmsProduct, delta: number) => {
    const newStock = Math.max(0, product.stockQuantity + delta);
    try {
      const res = await fetch("/api/admin/cms/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: product.id,
          patch: { stockQuantity: newStock },
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
      }
    } catch {
      alert("Failed to update stock");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the catalogue?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/cms/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setNotification(`Product "${name}" deleted from catalogue.`);
        setTimeout(() => setNotification(""), 3000);
      }
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPriceRupees) {
      alert("Name and Price are required.");
      return;
    }

    setIsCreating(true);
    try {
      const priceMinor = Math.round(Number(formPriceRupees) * 100);
      const compareMinor = formCompareRupees.trim()
        ? Math.round(Number(formCompareRupees) * 100)
        : undefined;

      const res = await fetch("/api/admin/cms/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          product: {
            name: formName.trim(),
            categorySlug: formCategorySlug,
            description: formDescription.trim() || "Handmade ocean shell treasure crafted with care.",
            priceMinor,
            compareAtPriceMinor: compareMinor,
            stockQuantity: Number(formStock) || 0,
            fulfilmentType: formFulfilment,
            materials: formMaterials.trim(),
            dimensions: formDimensions.trim(),
            imageUrl: (formImages[0] || "/images/products/golden-link-cowrie-charm-bracelet.webp").trim(),
            images: formImages.filter(Boolean),
            status: "active",
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        setShowAddModal(false);
        setFormName("");
        setFormDescription("");
        setFormImages(["/images/products/golden-link-cowrie-charm-bracelet.webp"]);
        setFormImageUrlInput("");
        setNotification("New product created with gallery and live in catalogue!");
        setTimeout(() => setNotification(""), 4000);
      } else {
        alert(data.error || "Failed to create product");
      }
    } catch {
      alert("Network error creating product");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedPrice = Number(editPriceRupees);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Please enter a valid price in Rupees.");
      return;
    }
    const priceMinor = Math.round(parsedPrice * 100);
    const compareAtPriceMinor = editCompareRupees.trim()
      ? Math.round(Number(editCompareRupees) * 100)
      : undefined;

    setIsSavingEdit(true);
    try {
      const activeImages =
        editingProduct.images && editingProduct.images.length > 0
          ? editingProduct.images
          : [editingProduct.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp"];

      const res = await fetch("/api/admin/cms/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: editingProduct.id,
          patch: {
            name: editingProduct.name,
            priceMinor,
            compareAtPriceMinor,
            stockQuantity: editingProduct.stockQuantity,
            fulfilmentType: editingProduct.fulfilmentType,
            materials: editingProduct.materials,
            dimensions: editingProduct.dimensions,
            description: editingProduct.description,
            imageUrl: (activeImages[0] || editingProduct.imageUrl).trim(),
            images: activeImages,
            status: editingProduct.status,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        );
        setEditingProduct(null);
        setNotification(`Product "${editingProduct.name}" saved! Price set to ₹${parsedPrice}.`);
        setTimeout(() => setNotification(""), 4000);
      } else {
        alert(data.error || "Failed to update product");
      }
    } catch {
      alert("Network error updating product");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-4 sm:p-6 lg:p-10 font-sans pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto">
        <AdminNav currentTab="products" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A16]">
                Catalogue &amp; Inventory CMS
              </h1>
              <span className="text-xs bg-[#2D1A16]/10 text-[#2D1A16] px-2.5 py-1 rounded-full font-semibold">
                {products.length} Products
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#2D1A16]/60 mt-1">
              Add new artisan jewellery items, adjust INR prices, modify stock levels, and toggle storefront visibility.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm whitespace-nowrap"
            >
              + Add New Product
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-[#2D1A16]/10">
          <input
            type="text"
            placeholder="Search products by title, materials, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44] flex-1 min-w-[200px]"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Visible)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {notification && (
          <div className="mb-6 p-3 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
            {notification}
          </div>
        )}

        {/* Products Table / Cards */}
        <div className="bg-white rounded-3xl border border-[#2D1A16]/10 shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#2D1A16]/60">
              No products match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#2D1A16]/10 bg-[#FAF5EF]/60 text-[#2D1A16]/60 uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Product</th>
                    <th className="py-3.5 px-3 font-semibold">Category</th>
                    <th className="py-3.5 px-3 font-semibold">Price</th>
                    <th className="py-3.5 px-3 font-semibold">Stock</th>
                    <th className="py-3.5 px-3 font-semibold">Fulfilment</th>
                    <th className="py-3.5 px-3 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D1A16]/10">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF5EF]/40 transition">
                      {/* Product image & name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 relative flex-shrink-0 border border-[#2D1A16]/10">
                            <Image
                              src={p.imageUrl}
                              alt={p.imageAlt || p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-[#2D1A16] line-clamp-1">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-[#2D1A16]/50 font-mono">
                              /{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-[#2D1A16]/80 font-medium">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#FAF5EF] border border-[#2D1A16]/10">
                          {p.categoryName}
                        </span>
                      </td>

                      {/* Price with Direct Quick Edit */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => startEditingProduct(p)}
                          title="Click to edit price and details"
                          className="group text-left p-1 -m-1 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                        >
                          <div className="font-bold font-mono text-[#2D1A16] group-hover:text-[#A05A44] flex items-center gap-1.5">
                            <span>{formatINR(p.priceMinor)}</span>
                            <span className="text-[10px] text-[#A05A44] font-sans font-medium px-1.5 py-0.2 rounded bg-amber-100/70 border border-amber-300">
                              Edit
                            </span>
                          </div>
                          {p.compareAtPriceMinor && (
                            <div className="text-[10px] text-stone-400 line-through">
                              {formatINR(p.compareAtPriceMinor)}
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Stock with quick adjusters */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStock(p, -1)}
                            className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-[#2D1A16] font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-semibold min-w-[20px] text-center ${
                              p.stockQuantity === 0 ? "text-red-600" : "text-[#2D1A16]"
                            }`}
                          >
                            {p.stockQuantity}
                          </span>
                          <button
                            onClick={() => handleUpdateStock(p, 1)}
                            className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-[#2D1A16] font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Fulfilment Type */}
                      <td className="py-3.5 px-3 text-[11px]">
                        {p.fulfilmentType === "made_to_order" ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                            Made to Order
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                            p.status === "active"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {p.status === "active" ? "Active" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditingProduct(p)}
                            className="text-xs font-semibold text-[#A05A44] hover:underline px-2 py-1 bg-[#FAF5EF] rounded-lg border border-[#A05A44]/20 hover:bg-[#FAF5EF]/80"
                          >
                            Edit Price
                          </button>
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#2D1A16]/60 hover:text-[#2D1A16] px-1.5 py-1"
                          >
                            View ↗
                          </a>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="text-xs text-rose-600 hover:text-rose-800 px-1 py-1"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Add New Product */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#2D1A16]/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#2D1A16]/10">
                <h3 className="font-serif text-xl font-bold text-[#2D1A16]">
                  Add New Catalogue Item
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-stone-400 hover:text-stone-700 text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Scallop Shell Pearl Drop Earrings"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategorySlug}
                      onChange={(e) => setFormCategorySlug(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Fulfilment Type
                    </label>
                    <select
                      value={formFulfilment}
                      onChange={(e) => setFormFulfilment(e.target.value as "in_stock" | "made_to_order")}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    >
                      <option value="in_stock">In Stock (Workshop)</option>
                      <option value="made_to_order">Made to Order (Personalized)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formPriceRupees}
                      onChange={(e) => setFormPriceRupees(e.target.value)}
                      placeholder="499"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Compare Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formCompareRupees}
                      onChange={(e) => setFormCompareRupees(e.target.value)}
                      placeholder="699"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Materials
                    </label>
                    <input
                      type="text"
                      value={formMaterials}
                      onChange={(e) => setFormMaterials(e.target.value)}
                      placeholder="e.g. Natural cowrie shells, sterling silver wires"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Dimensions / Length
                    </label>
                    <input
                      type="text"
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      placeholder="e.g. 18cm length + 3cm extender"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-[#2D1A16]/5 border border-[#2D1A16]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-[#2D1A16]/90 block">
                        Product Photo Gallery ({formImages.length} image{formImages.length > 1 ? "s" : ""}) *
                      </label>
                      <span className="text-[10px] text-[#2D1A16]/60">
                        Upload multiple photos or paste image links. #1 is the storefront cover image.
                      </span>
                    </div>
                    {isUploadingAddImage && (
                      <span className="text-[10px] text-amber-700 animate-pulse font-medium">
                        Uploading Photo(s)...
                      </span>
                    )}
                  </div>

                  {/* Multi-Image Thumbnails Grid */}
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {formImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative w-20 h-24 rounded-xl overflow-hidden border shadow-xs bg-stone-100 group ${
                          idx === 0 ? "border-[#A05A44] ring-2 ring-[#A05A44]/30" : "border-[#2D1A16]/20"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`View ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/images/products/shell-cone-pink-crackle-bracelet.webp";
                          }}
                        />

                        {/* Order Badge */}
                        <div className="absolute top-1 left-1">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                              idx === 0
                                ? "bg-[#A05A44] text-white"
                                : "bg-black/60 text-white"
                            }`}
                          >
                            {idx === 0 ? "★ Cover" : `#${idx + 1}`}
                          </span>
                        </div>

                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx, "add")}
                              className="w-full py-0.5 bg-white/90 text-[#2D1A16] rounded text-[9px] font-bold hover:bg-white"
                              title="Make this the cover image"
                            >
                              ★ Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, "add")}
                            className="w-full py-0.5 bg-red-600/90 text-white rounded text-[9px] font-bold hover:bg-red-700"
                            title="Remove photo"
                          >
                            🗑 Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Image Actions */}
                  <div className="space-y-2 pt-2 border-t border-[#2D1A16]/10">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-[11px] font-semibold hover:bg-black transition shadow-xs">
                        <span>📷 Upload Photo(s)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingAddImage}
                          onChange={(e) => {
                            if (e.target.files) handleFileUpload(e.target.files, "add");
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-[#2D1A16]/60">Select one or multiple images from device</span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={formImageUrlInput}
                        onChange={(e) => setFormImageUrlInput(e.target.value)}
                        placeholder="Or paste image link (e.g. hosted URL or imgbb link)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddUrl(formImageUrlInput, "add")}
                        disabled={!formImageUrlInput.trim() || isUploadingAddImage}
                        className="px-3 py-1.5 rounded-xl bg-[#2D1A16]/10 hover:bg-[#2D1A16]/20 text-[#2D1A16] text-xs font-semibold disabled:opacity-50"
                      >
                        + Add Image URL
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Description &amp; Story
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Artisan description of craftsmanship, shell origins, and packaging..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#2D1A16]/60 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm"
                  >
                    {isCreating ? "Adding..." : "Add to Storefront"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Product */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#2D1A16]/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#2D1A16]/10">
                <h3 className="font-serif text-xl font-bold text-[#2D1A16]">
                  Edit Product: {editingProduct.name}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-stone-400 hover:text-stone-700 text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-300 text-xs text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <span>⚡</span>
                    <span>Live Storefront Price &amp; Inventory Sync</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Changing the price below immediately updates the database and reflects across the customer storefront, catalogue listings, product pages, and cart calculations.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Price (₹ INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={editPriceRupees}
                        onChange={(e) => setEditPriceRupees(e.target.value)}
                        placeholder="199"
                        className="w-full pl-6 pr-2 py-2 text-xs font-bold font-mono rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44] bg-white text-[#2D1A16]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Compare Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editCompareRupees}
                        onChange={(e) => setEditCompareRupees(e.target.value)}
                        placeholder="299"
                        className="w-full pl-6 pr-2 py-2 text-xs font-mono rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44] bg-white text-stone-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stockQuantity}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stockQuantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Fulfilment
                    </label>
                    <select
                      value={editingProduct.fulfilmentType}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          fulfilmentType: e.target.value as "in_stock" | "made_to_order",
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="made_to_order">Made to Order</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Status
                    </label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          status: e.target.value as "active" | "draft" | "archived",
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-[#2D1A16]/5 border border-[#2D1A16]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-[#2D1A16]/90 block">
                        Product Photo Gallery ({(editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.imageUrl]).length} image{((editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.imageUrl]).length) > 1 ? "s" : ""})
                      </label>
                      <span className="text-[10px] text-[#2D1A16]/60">
                        Upload or attach multiple product photos. #1 is the storefront cover image.
                      </span>
                    </div>
                    {isUploadingEditImage && (
                      <span className="text-[10px] text-amber-700 animate-pulse font-medium">
                        Uploading Photo(s)...
                      </span>
                    )}
                  </div>

                  {/* Multi-Image Thumbnails Grid with Mobile-Friendly Controls */}
                  <div className="flex flex-wrap gap-2.5 items-start">
                    {(editingProduct.images && editingProduct.images.length > 0
                      ? editingProduct.images
                      : [editingProduct.imageUrl || "/images/products/golden-link-cowrie-charm-bracelet.webp"]
                    ).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center gap-1 p-1 rounded-xl bg-white border shadow-xs ${
                          idx === 0 ? "border-[#A05A44] ring-2 ring-[#A05A44]/30" : "border-[#2D1A16]/20"
                        }`}
                      >
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-stone-100">
                          <img
                            src={imgUrl}
                            alt={`View ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/images/products/shell-cone-pink-crackle-bracelet.webp";
                            }}
                          />

                          {/* Order Badge */}
                          <div className="absolute top-1 left-1">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                idx === 0
                                  ? "bg-[#A05A44] text-white"
                                  : "bg-black/60 text-white"
                              }`}
                            >
                              {idx === 0 ? "★ Cover" : `#${idx + 1}`}
                            </span>
                          </div>
                        </div>

                        {/* Visible Touch Controls */}
                        <div className="flex items-center gap-1 w-full justify-between pt-0.5 px-0.5">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx, "edit")}
                              className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-[#2D1A16] rounded text-[9px] font-semibold transition"
                              title="Make this the cover image"
                            >
                              ★ Cover
                            </button>
                          ) : (
                            <span className="text-[9px] text-[#A05A44] font-semibold px-1">Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, "edit")}
                            className="px-1.5 py-0.5 text-rose-600 hover:text-rose-800 text-[10px] font-bold rounded hover:bg-rose-50 transition"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Image Actions */}
                  <div className="space-y-2 pt-2 border-t border-[#2D1A16]/10">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-[11px] font-semibold hover:bg-black transition shadow-xs">
                        <span>📷 Upload Photo(s)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingEditImage}
                          onChange={(e) => {
                            if (e.target.files) handleFileUpload(e.target.files, "edit");
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-[#2D1A16]/60">Select one or multiple photos from device</span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editImageUrlInput}
                        onChange={(e) => setEditImageUrlInput(e.target.value)}
                        placeholder="Or paste image link (e.g. hosted URL or imgbb link)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddUrl(editImageUrlInput, "edit")}
                        disabled={!editImageUrlInput.trim() || isUploadingEditImage}
                        className="px-3 py-1.5 rounded-xl bg-[#2D1A16]/10 hover:bg-[#2D1A16]/20 text-[#2D1A16] text-xs font-semibold disabled:opacity-50"
                      >
                        + Add Image URL
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Materials
                  </label>
                  <input
                    type="text"
                    value={editingProduct.materials}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, materials: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#2D1A16]/60 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm"
                  >
                    {isSavingEdit ? "Saving..." : "Save Product Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
