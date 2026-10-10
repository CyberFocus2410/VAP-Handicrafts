import { notFound } from "next/navigation";

export default function AdminPage() {
  // Admin is guarded by middleware; default deny per PLAN.md Phase 1 §9
  notFound();
}
