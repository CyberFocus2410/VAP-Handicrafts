import { getSiteContentConfig } from "@/server/admin/cms-service";
import { AdminContentView } from "@/components/admin/AdminContentView";

export const metadata = {
  title: "Storefront & Hero CMS | VAP Handicrafts Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const config = await getSiteContentConfig();
  return <AdminContentView initialConfig={config} />;
}
