import ServiceGrid from "@/components/ServiceGrid";
import { demoServices } from "@/lib/demo-data";
import { getActiveCategories } from "@/lib/category-data";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    await connectDB();

    const services = await Service.find({})
      .sort({ createdAt: -1 })
      .lean();

    return services.length ? services : demoServices;
  } catch (error) {
    console.error("Services DB error:", error);
    return demoServices;
  }
}

async function getCategories() {
  try {
    const categories = await getActiveCategories();

    return categories?.length ? categories : [];
  } catch (error) {
    console.error("Categories DB error:", error);
    return [];
  }
}

export default async function ServicesPage({ searchParams }) {
  const params = await searchParams;

  const [services, categories] = await Promise.all([
    getServices(),
    getCategories(),
  ]);

  return (
    <main>
      <ServiceGrid
        services={services}
        categories={categories}
        initialCategory={params?.category || "All"}
        initialQuery={params?.search || ""}
      />
    </main>
  );
}