import { listAllOrders } from "@/server/orders/service";
import { listAllCustomers, listAllInquiries } from "@/server/admin/crm-service";
import { listCmsProducts } from "@/server/admin/cms-service";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";

export const metadata = {
  title: "Admin Command Hub | VAP Handicrafts",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [orders, customers, inquiries, products] = await Promise.all([
    listAllOrders(),
    listAllCustomers(),
    listAllInquiries(),
    listCmsProducts(),
  ]);

  return (
    <AdminDashboardOverview
      orders={orders}
      customers={customers}
      inquiries={inquiries}
      productCount={products.length}
    />
  );
}
