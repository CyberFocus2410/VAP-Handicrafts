import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/api/admin/manifest",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
