import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/login?next=/admin");
  return <AdminDashboard admin={{ name: session.name, email: session.email }} />;
}
