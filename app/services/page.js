import ServiceGrid from "@/components/ServiceGrid";
import {
  demoServices,
  categories as demoCategories,
} from "@/lib/demo-data";
import { getAppUrl } from "@/lib/app-url";

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    const baseUrl = getAppUrl();

    const res = await fetch(`${baseUrl}/api/services`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Services API failed: ${res.status}`);
    }

    const data = await res.json();

    return Array.isArray(data.services)
      ? data.services
      : demoServices;
  } catch (error) {
    console.error("Services API error:", error);
    return demoServices;
  }
}

async function getCategories() {
  try {
    const baseUrl = getAppUrl();

    const res = await fetch(`${baseUrl}/api/categories`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Categories API failed: ${res.status}`);
    }

    const data = await res.json();

    return Array.isArray(data.categories) &&
      data.categories.length
      ? data.categories
      : demoCategories;
  } catch (error) {
    console.error("Categories API error:", error);
    return demoCategories;
  }
}

export default async function ServicesPage({
  searchParams,
}) {
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