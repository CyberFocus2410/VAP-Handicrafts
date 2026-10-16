"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AdminNav } from "./AdminNav";
import { CmsCategory } from "@/server/admin/cms-service";
import { compressImageForUpload, fileToDataUrl } from "@/lib/images/client-compress";

interface AdminCategoriesViewProps {
  initialCategories: CmsCategory[];
}

export const AdminCategoriesView: React.FC<AdminCategoriesViewProps> = ({
  initialCategories,
}) => {
  const [categories, setCategories] = useState<CmsCategory[]>(initialCategories);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CmsCategory | null>(null);

  // Form states
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("/images/products/shell-cone-pink-crackle-bracelet.webp");
  const [displayOrder, setDisplayOrder] = useState<string>("1");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Image upload states
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);
  const [isUploadingAddImage, setIsUploadingAddImage] = useState<boolean>(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState<boolean>(false);

  // Common image upload routine with client compression & resilient fallback
  const uploadCategoryImage = async (rawFile: File): Promise<string> => {
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
    } catch (err) {
      console.warn("[Category Upload] Server fetch notice, utilizing local fallback:", err);
    }

    if (!finalUrl) {
      finalUrl = await fileToDataUrl(file);
    }
    return finalUrl;
  };

  // Helper to resolve imgbb or external links
  const resolveImageUrl = async (url: string): Promise<string> => {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (
      (trimmed.includes("ibb.co/") || trimmed.includes("imgbb.com/")) &&
      !trimmed.includes("i.ibb.co/")
    ) {
      try {
        const res = await fetch("/api/admin/cms/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json().catch(() => null);
        if (data?.success && data?.url) {
          return data.url;
        }
      } catch {
        // Fall through
      }
    }
    return trimmed;
  };

  // 1-Click photo update directly from category card
  const handleCardImageUpload = async (cat: CmsCategory, rawFile: File) => {
    setUploadingCardId(cat.id);
    try {
      const finalUrl = await uploadCategoryImage(rawFile);
      if (finalUrl) {
        const res = await fetch("/api/admin/cms/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            id: cat.id,
            patch: { imageUrl: finalUrl },
          }),
        });
        const data = await res.json().catch(() => null);
        if (data?.success && data?.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === cat.id ? data.category : c))
          );
        } else {
          setCategories((prev) =>
            prev.map((c) => (c.id === cat.id ? { ...c, imageUrl: finalUrl } : c))
          );
        }
        setNotification(`Collection "${cat.name}" photo updated and saved live!`);
        setTimeout(() => setNotification(""), 3500);
      }
    } catch (err) {
      console.error("Card image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingCardId(null);
    }
  };

  // Add modal image upload
  const handleAddImageUpload = async (rawFile: File) => {
    setIsUploadingAddImage(true);
    try {
      const finalUrl = await uploadCategoryImage(rawFile);
      if (finalUrl) {
        setImageUrl(finalUrl);
        setNotification("Image uploaded and attached for new collection!");
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (err) {
      console.error("Add category image upload failed:", err);
      alert("Failed to process image. Please try another file.");
    } finally {
      setIsUploadingAddImage(false);
    }
  };

  // Edit modal image upload
  const handleEditImageUpload = async (rawFile: File) => {
    if (!editingCategory) return;
    setIsUploadingEditImage(true);
    try {
      const finalUrl = await uploadCategoryImage(rawFile);
      if (finalUrl) {
        setEditingCategory((prev) =>
          prev ? { ...prev, imageUrl: finalUrl } : null
        );
        setNotification("New image uploaded! Click 'Save Changes' to apply.");
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (err) {
      console.error("Edit category image upload failed:", err);
      alert("Failed to process image. Please try another file.");
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  const handleToggleActive = async (cat: CmsCategory) => {
    try {
      const res = await fetch("/api/admin/cms/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: cat.id,
          patch: { isActive: !cat.isActive },
        }),
      });

      const data = await res.json();
      if (data.success && data.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? data.category : c))
        );
        setNotification(`Category "${cat.name}" status updated!`);
        setTimeout(() => setNotification(""), 3000);
      }
    } catch {
      alert("Failed to toggle category status");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/cms/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          category: {
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim(),
            imageUrl: imageUrl.trim(),
            displayOrder: Number(displayOrder) || categories.length + 1,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.category) {
        setCategories((prev) => [...prev, data.category]);
        setShowAddModal(false);
        setName("");
        setSlug("");
        setDescription("");
        setNotification("New category created successfully!");
        setTimeout(() => setNotification(""), 3000);
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch {
      alert("Network error creating category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/cms/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: editingCategory.id,
          patch: {
            name: editingCategory.name,
            slug: editingCategory.slug,
            description: editingCategory.description,
            imageUrl: editingCategory.imageUrl,
            displayOrder: Number(editingCategory.displayOrder),
            isActive: editingCategory.isActive,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? data.category : c))
        );
        setEditingCategory(null);
        setNotification("Category updated successfully!");
        setTimeout(() => setNotification(""), 3000);
      } else {
        alert(data.error || "Failed to update category");
      }
    } catch {
      alert("Network error updating category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-4 sm:p-6 lg:p-10 font-sans pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto">
        <AdminNav currentTab="categories" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A16]">
                Storefront Categories CMS
              </h1>
              <span className="text-xs bg-[#2D1A16]/10 text-[#2D1A16] px-2.5 py-1 rounded-full font-semibold">
                {categories.length} Collections
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#2D1A16]/60 mt-1">
              Organize shell jewellery lines, personalized card templates, display order, and collection hero images.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm whitespace-nowrap"
            >
              + Add Collection
            </button>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-3 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
            {notification}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-5 border border-[#2D1A16]/10 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-44 rounded-2xl overflow-hidden relative mb-4 bg-stone-100 border border-[#2D1A16]/5 group">
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md transition ${
                        c.isActive
                          ? "bg-emerald-600/90 text-white shadow-sm"
                          : "bg-stone-800/80 text-stone-200"
                      }`}
                    >
                      {c.isActive ? "Active" : "Hidden"}
                    </button>
                  </div>

                  {/* Quick Change Photo Button right on the card */}
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <label
                      className={`cursor-pointer px-3 py-1.5 rounded-xl text-[11px] font-semibold backdrop-blur-md shadow-md transition flex items-center gap-1.5 ${
                        uploadingCardId === c.id
                          ? "bg-amber-600/95 text-white animate-pulse"
                          : "bg-white/95 text-[#2D1A16] hover:bg-white hover:scale-105"
                      }`}
                      title="Upload new image directly for this collection"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingCardId === c.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCardImageUpload(c, file);
                          e.target.value = "";
                        }}
                      />
                      <span>📷</span>
                      <span>
                        {uploadingCardId === c.id ? "Uploading..." : "Change Photo"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-lg text-[#2D1A16]">
                    {c.name}
                  </h3>
                  <span className="text-[11px] font-mono font-semibold text-[#A05A44] bg-[#FAF5EF] px-2 py-0.5 rounded-full">
                    Order #{c.displayOrder}
                  </span>
                </div>

                <div className="text-xs font-mono text-[#2D1A16]/50 mt-0.5">
                  /categories/{c.slug}
                </div>

                <p className="text-xs text-[#2D1A16]/70 mt-2.5 line-clamp-2 leading-relaxed">
                  {c.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#2D1A16]/5">
                <a
                  href={`/products?category=${c.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2D1A16]/60 hover:text-[#2D1A16] flex items-center gap-1"
                >
                  <span>View Products</span>
                  <span>↗</span>
                </a>
                <button
                  onClick={() => setEditingCategory({ ...c })}
                  className="text-xs font-semibold text-[#A05A44] hover:underline flex items-center gap-1"
                >
                  <span>✏️</span>
                  <span>Edit Collection</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Category */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#2D1A16]/10 shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#2D1A16]/10">
                <h3 className="font-serif text-xl font-bold text-[#2D1A16]">
                  Add Collection Category
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-stone-400 hover:text-stone-700 text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shell Necklaces"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Slug (optional)
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="auto-generated"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                {/* Banner Photo Section with Upload & Preview */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-[#2D1A16]/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#2D1A16]/80">
                      Collection Banner Photo *
                    </label>
                    {isUploadingAddImage && (
                      <span className="text-[10px] text-[#A05A44] font-medium animate-pulse">
                        Optimizing & uploading...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-stone-200 border border-[#2D1A16]/10 shrink-0 shadow-inner">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Category preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm ${
                          isUploadingAddImage
                            ? "bg-stone-300 text-stone-600 cursor-not-allowed"
                            : "bg-[#2D1A16] text-[#FAF5EF] hover:bg-black"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingAddImage}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAddImageUpload(file);
                            e.target.value = "";
                          }}
                        />
                        <span>📷</span>
                        <span>
                          {isUploadingAddImage ? "Uploading Photo..." : "Upload New Image"}
                        </span>
                      </label>
                      <p className="text-[10px] text-[#2D1A16]/50">
                        Select any image from phone or device. Auto-compressed to WebP.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-[#2D1A16]/60 block mb-1">
                      Or image URL / ImgBB link:
                    </span>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onBlur={async (e) => {
                        const resolved = await resolveImageUrl(e.target.value);
                        if (resolved !== e.target.value) setImageUrl(resolved);
                      }}
                      placeholder="/images/products/... or https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description for storefront filter and header..."
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
                    disabled={isSubmitting || isUploadingAddImage}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Collection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Category */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#2D1A16]/10 shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#2D1A16]/10">
                <h3 className="font-serif text-xl font-bold text-[#2D1A16]">
                  Edit Collection: {editingCategory.name}
                </h3>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="text-stone-400 hover:text-stone-700 text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={editingCategory.slug}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, slug: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={editingCategory.displayOrder}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          displayOrder: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                {/* Banner Photo Section with Upload & Preview */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-[#2D1A16]/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#2D1A16]/80">
                      Collection Banner Photo *
                    </label>
                    {isUploadingEditImage && (
                      <span className="text-[10px] text-[#A05A44] font-medium animate-pulse">
                        Optimizing & uploading...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-stone-200 border border-[#2D1A16]/10 shrink-0 shadow-inner">
                      {editingCategory.imageUrl ? (
                        <Image
                          src={editingCategory.imageUrl}
                          alt={editingCategory.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm ${
                          isUploadingEditImage
                            ? "bg-stone-300 text-stone-600 cursor-not-allowed"
                            : "bg-[#2D1A16] text-[#FAF5EF] hover:bg-black"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingEditImage}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleEditImageUpload(file);
                            e.target.value = "";
                          }}
                        />
                        <span>📷</span>
                        <span>
                          {isUploadingEditImage ? "Uploading Photo..." : "Upload New Image"}
                        </span>
                      </label>
                      <p className="text-[10px] text-[#2D1A16]/50">
                        Takes effect immediately upon saving changes. Auto-compressed for fast loading.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-[#2D1A16]/60 block mb-1">
                      Or image URL / ImgBB link:
                    </span>
                    <input
                      type="text"
                      value={editingCategory.imageUrl}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, imageUrl: e.target.value })
                      }
                      onBlur={async (e) => {
                        const resolved = await resolveImageUrl(e.target.value);
                        if (resolved !== e.target.value) {
                          setEditingCategory({ ...editingCategory, imageUrl: resolved });
                        }
                      }}
                      placeholder="/images/products/... or https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingCategory.description}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#2D1A16]/60 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingEditImage}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
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
