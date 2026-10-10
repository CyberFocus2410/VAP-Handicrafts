import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export type Category = z.infer<typeof CategorySchema>;

export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().min(1),
  priceMinor: z.number().int().nonnegative(),
  compareAtPriceMinor: z.number().int().positive().nullable().optional(),
  stockQuantity: z.number().int().nonnegative().nullable().optional(),
  isDevPrice: z.boolean().default(true),
  inStock: z.boolean().default(true),
  attributes: z.record(z.string(), z.unknown()).default({}),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductImageSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  url: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  displayOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});
export type ProductImage = z.infer<typeof ProductImageSchema>;

export const ProductDetailSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  categorySlug: z.string().min(1),
  categoryName: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["draft", "active", "archived"]).default("active"),
  fulfilmentType: z.enum(["in_stock", "made_to_order"]).default("made_to_order"),
  materials: z.array(z.string()).default([]),
  dimensions: z.string().nullable().optional(),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  variants: z.array(ProductVariantSchema).min(1),
  images: z.array(ProductImageSchema).min(1),
  // Computed pricing from primary/lowest variant
  priceMinor: z.number().int().nonnegative(),
  compareAtPriceMinor: z.number().int().positive().nullable().optional(),
  isDevPrice: z.boolean().default(true),
  inStock: z.boolean().default(true),
});
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

export const CatalogueFilterSchema = z.object({
  categorySlug: z.string().optional(),
  minPriceMinor: z.number().int().nonnegative().optional(),
  maxPriceMinor: z.number().int().nonnegative().optional(),
  inStockOnly: z.boolean().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "featured"]).default("featured"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(12),
});
export type CatalogueFilter = z.infer<typeof CatalogueFilterSchema>;

export const AdminProductCreateInputSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  categorySlug: z.string().min(1),
  description: z.string().min(10),
  fulfilmentType: z.enum(["in_stock", "made_to_order"]).default("made_to_order"),
  materials: z.array(z.string()).default([]),
  dimensions: z.string().optional(),
  priceMinor: z.number().int().nonnegative(),
  compareAtPriceMinor: z.number().int().positive().optional(),
  initialStock: z.number().int().nonnegative().default(10),
  sku: z.string().min(3),
  imageUrl: z.string().min(1),
  imageAlt: z.string().min(10),
});
export type AdminProductCreateInput = z.infer<typeof AdminProductCreateInputSchema>;
