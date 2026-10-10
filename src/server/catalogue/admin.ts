import "server-only";
import { getSupabaseAdminClient } from "@/server/db/supabase";
import {
  AdminProductCreateInputSchema,
  type AdminProductCreateInput,
} from "./types";

export interface AdminUserContext {
  userId: string;
  email: string;
  role?: string;
  ipAddress?: string;
}

/**
 * Creates a product with initial variant and image, and records an audit log entry.
 * Privileged operation strictly executed through service-role client on the server.
 */
export async function adminCreateProduct(
  input: AdminProductCreateInput,
  adminContext: AdminUserContext
) {
  const validated = AdminProductCreateInputSchema.parse(input);
  const supabase = getSupabaseAdminClient();

  // 1. Resolve category ID
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", validated.categorySlug)
    .single();

  const categoryId = category?.id ?? null;

  // 2. Insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: validated.name,
      slug: validated.slug,
      category_id: categoryId,
      description: validated.description,
      fulfilment_type: validated.fulfilmentType,
      materials: validated.materials,
      dimensions: validated.dimensions,
      status: "active",
    })
    .select()
    .single();

  if (productError || !product) {
    throw new Error(`Failed to create product: ${productError?.message ?? "Unknown error"}`);
  }

  // 3. Insert primary variant
  const { error: variantError } = await supabase
    .from("product_variants")
    .insert({
      product_id: product.id,
      name: "Default",
      sku: validated.sku,
      price_minor: validated.priceMinor,
      compare_at_price_minor: validated.compareAtPriceMinor ?? null,
      stock_quantity: validated.initialStock,
      is_dev_price: true,
      in_stock: validated.initialStock > 0,
    });

  if (variantError) {
    throw new Error(`Failed to create variant: ${variantError.message}`);
  }

  // 4. Insert primary image
  const { error: imageError } = await supabase
    .from("product_images")
    .insert({
      product_id: product.id,
      url: validated.imageUrl,
      alt: validated.imageAlt,
      width: 800,
      height: 1000,
      display_order: 1,
      is_primary: true,
    });

  if (imageError) {
    throw new Error(`Failed to attach image: ${imageError.message}`);
  }

  // 5. Insert audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: adminContext.userId,
    action: "product.create",
    entity_type: "product",
    entity_id: product.id,
    details: {
      name: validated.name,
      slug: validated.slug,
      priceMinor: validated.priceMinor,
      sku: validated.sku,
    },
    ip_address: adminContext.ipAddress ?? null,
  });

  return product;
}

/**
 * Updates variant stock quantity and logs the change in audit log.
 */
export async function adminUpdateVariantStock(
  variantId: string,
  newStock: number,
  adminContext: AdminUserContext
) {
  if (newStock < 0 || !Number.isInteger(newStock)) {
    throw new Error("Stock quantity must be a non-negative integer.");
  }

  const supabase = getSupabaseAdminClient();

  const { data: updatedVariant, error } = await supabase
    .from("product_variants")
    .update({
      stock_quantity: newStock,
      in_stock: newStock > 0,
    })
    .eq("id", variantId)
    .select()
    .single();

  if (error || !updatedVariant) {
    throw new Error(`Failed to update stock: ${error?.message ?? "Variant not found"}`);
  }

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: adminContext.userId,
    action: "variant.stock_update",
    entity_type: "product_variant",
    entity_id: variantId,
    details: {
      newStock,
      inStock: newStock > 0,
      sku: updatedVariant.sku,
    },
    ip_address: adminContext.ipAddress ?? null,
  });

  return updatedVariant;
}
