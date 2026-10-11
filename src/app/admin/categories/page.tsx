import { listCmsCategories } from "@/server/admin/cms-service";
import { AdminCategoriesView } from "@/components/admin/AdminCategoriesView";

export const metadata = {
  title: "Categories CMS | VAP Handicrafts Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCmsCategories();
  return <AdminCategoriesView initialCategories={categories} />;
}
