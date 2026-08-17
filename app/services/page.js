import ServiceGrid from "@/components/ServiceGrid";
import {
  demoServices,
  categories as demoCategories,
} from "@/lib/demo-data";
import { getAppUrl } from "@/lib/app-url";

export const dynamic = "force-dynamic";

/**
 * Convert MongoDB/Mongoose values into
 * plain values that can safely be passed
 * from Server Components to Client Components.
 */
function serializeService(service) {
  return {
    ...service,

    _id:
      service?._id !== undefined && service?._id !== null
        ? String(service._id)
        : "",

    slug: service?.slug ? String(service.slug) : "",

    name: service?.name ? String(service.name) : "",

    category: service?.category
      ? String(service.category)
      : "",

    providerName: service?.providerName
      ? String(service.providerName)
      : "",

    address: service?.address
      ? String(service.address)
      : "",

    city: service?.city
      ? String(service.city)
      : "",

    description: service?.description
      ? String(service.description)
      : "",

    image: service?.image
      ? String(service.image)
      : "",

    imagePublicId: service?.imagePublicId
      ? String(service.imagePublicId)
      : "",

    gallery: Array.isArray(service?.gallery)
      ? service.gallery.map((image) => String(image))
      : [],

    rating:
      service?.rating !== undefined &&
      service?.rating !== null
        ? Number(service.rating)
        : 0,

    reviews:
      service?.reviews !== undefined &&
      service?.reviews !== null
        ? Number(service.reviews)
        : 0,

    availableFrom: service?.availableFrom
      ? String(service.availableFrom)
      : "",

    availableTo: service?.availableTo
      ? String(service.availableTo)
      : "",

    slots: Array.isArray(service?.slots)
      ? service.slots.map((slot) => String(slot))
      : [],

    status: service?.status
      ? String(service.status)
      : "",

    createdAt: service?.createdAt
      ? new Date(service.createdAt).toISOString()
      : null,

    updatedAt: service?.updatedAt
      ? new Date(service.updatedAt).toISOString()
      : null,
  };
}

/**
 * Convert category MongoDB values into
 * plain serializable values.
 */
function serializeCategory(category) {
  return {
    ...category,

    _id:
      category?._id !== undefined &&
      category?._id !== null
        ? String(category._id)
        : "",

    name: category?.name
      ? String(category.name)
      : "",

    slug: category?.slug
      ? String(category.slug)
      : "",

    icon: category?.icon
      ? String(category.icon)
      : "",

    createdAt: category?.createdAt
      ? new Date(category.createdAt).toISOString()
      : null,

    updatedAt: category?.updatedAt
      ? new Date(category.updatedAt).toISOString()
      : null,
  };
}

async function getServices() {
  try {
    const baseUrl = getAppUrl();

    const res = await fetch(`${baseUrl}/api/services`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Services API failed: ${res.status}`
      );
    }

    const data = await res.json();

    const services = Array.isArray(data.services)
      ? data.services
      : demoServices;

    return services.map(serializeService);
  } catch (error) {
    console.error("Services API error:", error);

    return demoServices.map(serializeService);
  }
}

async function getCategories() {
  try {
    const baseUrl = getAppUrl();

    const res = await fetch(`${baseUrl}/api/categories`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Categories API failed: ${res.status}`
      );
    }

    const data = await res.json();

    const categories =
      Array.isArray(data.categories) &&
      data.categories.length
        ? data.categories
        : demoCategories;

    return categories.map(serializeCategory);
  } catch (error) {
    console.error("Categories API error:", error);

    return demoCategories.map(serializeCategory);
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