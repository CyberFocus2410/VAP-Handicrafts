import { listAllCustomers } from "@/server/admin/crm-service";
import { AdminCustomersView } from "@/components/admin/AdminCustomersView";

export const metadata = {
  title: "Customer 360° CRM | VAP Handicrafts Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await listAllCustomers();
  return <AdminCustomersView initialCustomers={customers} />;
}
