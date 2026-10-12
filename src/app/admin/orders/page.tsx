import { listAllOrders } from "@/server/orders/service";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";

export const metadata = {
  title: "Orders Dashboard | VAP Handicrafts Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listAllOrders();

  return <AdminOrdersView initialOrders={orders} />;
}
