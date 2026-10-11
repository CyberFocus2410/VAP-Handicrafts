import { listCmsProducts, listCmsCategories } from "@/server/admin/cms-service";
import { AdminProductsView } from "@/components/admin/AdminProductsView";

export const metadata = {
  title: "Products & Stock CMS | VAP Handicrafts Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    listCmsProducts(),
    listCmsCategories(),
  ]);

  return <AdminProductsView initialProducts={products} categories={categories} />;
}
