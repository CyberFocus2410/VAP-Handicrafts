import { listAllInquiries } from "@/server/admin/crm-service";
import { AdminInquiriesView } from "@/components/admin/AdminInquiriesView";

export const metadata = {
  title: "Custom Inquiries & Leads | VAP Handicrafts Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await listAllInquiries();
  return <AdminInquiriesView initialInquiries={inquiries} />;
}
