"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AdminNav } from "./AdminNav";
import { CmsCategory } from "@/server/admin/cms-service";

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
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-6 lg:p-10 font-sans">
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
                <div className="w-full h-40 rounded-2xl overflow-hidden relative mb-4 bg-stone-100 border border-[#2D1A16]/5">
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md transition ${
                        c.isActive
                          ? "bg-emerald-600/90 text-white"
                          : "bg-stone-800/80 text-stone-200"
                      }`}
                    >
                      {c.isActive ? "Active" : "Hidden"}
                    </button>
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
                  className="text-xs font-semibold text-[#A05A44] hover:underline"
                >
                  Edit Collection
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
                    placeholder="e.g. Festive & Return Favors"
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

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/images/products/..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
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
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm"
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

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={editingCategory.imageUrl}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, imageUrl: e.target.value })
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
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm"
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
