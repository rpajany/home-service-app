import ServiceGrid from "@/components/ServiceGrid";
import { demoServices } from "@/lib/demo-data";

async function getServices() {
  try { const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/services`, { cache: "no-store" }); if (res.ok) return (await res.json()).services; } catch {}
  return demoServices;
}

export default async function ServicesPage({ searchParams }) {
  const services = await getServices();
  const params = await searchParams;
  return <main><ServiceGrid services={services} initialCategory={params?.category || "All"} initialQuery={params?.search || ""}/></main>;
}
