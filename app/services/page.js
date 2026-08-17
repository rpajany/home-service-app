import ServiceGrid from "@/components/ServiceGrid";
import {
  demoServices,
  categories as demoCategories,
} from "@/lib/demo-data";

import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

/**
 * Convert a MongoDB/Mongoose service document
 * into a completely plain object that can safely
 * be passed to the Client Component.
 */
function serializeService(service) {
  if (!service) return null;

  return {
    _id:
      service._id !== undefined && service._id !== null
        ? String(service._id)
        : "",

    slug: service.slug ? String(service.slug) : "",

    name: service.name ? String(service.name) : "",

    category: service.category
      ? String(service.category)
      : "",

    providerName: service.providerName
      ? String(service.providerName)
      : "",

    address: service.address
      ? String(service.address)
      : "",

    city: service.city
      ? String(service.city)
      : "",

    email: service.email
      ? String(service.email)
      : "",

    description: service.description
      ? String(service.description)
      : "",

    image: service.image
      ? String(service.image)
      : "",

    imagePublicId: service.imagePublicId
      ? String(service.imagePublicId)
      : "",

    gallery: Array.isArray(service.gallery)
      ? service.gallery.map((image) => String(image))
      : [],

    rating:
      service.rating !== undefined &&
      service.rating !== null
        ? Number(service.rating)
        : 0,

    reviews:
      service.reviews !== undefined &&
      service.reviews !== null
        ? Number(service.reviews)
        : 0,

    availableFrom: service.availableFrom
      ? String(service.availableFrom)
      : "",

    availableTo: service.availableTo
      ? String(service.availableTo)
      : "",

    slots: Array.isArray(service.slots)
      ? service.slots.map((slot) => String(slot))
      : [],

    status: service.status
      ? String(service.status)
      : "",

    createdAt: service.createdAt
      ? new Date(service.createdAt).toISOString()
      : null,

    updatedAt: service.updatedAt
      ? new Date(service.updatedAt).toISOString()
      : null,
  };
}

/**
 * Convert a MongoDB/Mongoose category document
 * into a completely plain object.
 */
function serializeCategory(category) {
  if (!category) return null;

  return {
    _id:
      category._id !== undefined &&
      category._id !== null
        ? String(category._id)
        : "",

    name: category.name
      ? String(category.name)
      : "",

    slug: category.slug
      ? String(category.slug)
      : "",

    icon: category.icon
      ? String(category.icon)
      : "",

    createdAt: category.createdAt
      ? new Date(category.createdAt).toISOString()
      : null,

    updatedAt: category.updatedAt
      ? new Date(category.updatedAt).toISOString()
      : null,
  };
}

/**
 * Get services directly from MongoDB.
 *
 * This is the same approach that was working
 * in your old Services page.
 */
async function getServices() {
  try {
    await connectDB();

    const services = await Service.find({})
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      "SERVICES PAGE - MongoDB services:",
      services.length
    );

    console.log(
      "SERVICES PAGE - categories:",
      services.map((service) => ({
        name: service.name,
        category: service.category,
      }))
    );

    const serializedServices = services
      .map(serializeService)
      .filter(Boolean);

    return serializedServices.length
      ? serializedServices
      : demoServices.map(serializeService);
  } catch (error) {
    console.error(
      "SERVICES PAGE - MongoDB services error:",
      error
    );

    return demoServices
      .map(serializeService)
      .filter(Boolean);
  }
}

/**
 * Get categories directly from MongoDB.
 */
async function getCategories() {
  try {
    await connectDB();

    const categories = await Category.find({})
      .sort({ name: 1 })
      .lean();

    console.log(
      "SERVICES PAGE - MongoDB categories:",
      categories.length
    );

    console.log(
      "SERVICES PAGE - category names:",
      categories.map((category) => category.name)
    );

    const serializedCategories = categories
      .map(serializeCategory)
      .filter(Boolean);

    return serializedCategories.length
      ? serializedCategories
      : demoCategories.map(serializeCategory);
  } catch (error) {
    console.error(
      "SERVICES PAGE - MongoDB categories error:",
      error
    );

    return demoCategories
      .map(serializeCategory)
      .filter(Boolean);
  }
}

export default async function ServicesPage({
  searchParams,
}) {
  const params = await searchParams;

  /*
   * Both queries use MongoDB directly.
   *
   * Promise.all is safe because connectDB() is cached
   * in your DB utility in normal Next.js/Mongoose usage.
   */
  const [services, categories] = await Promise.all([
    getServices(),
    getCategories(),
  ]);

  console.log(
    "SERVICES PAGE - Final services:",
    services.map((service) => ({
      name: service.name,
      category: service.category,
    }))
  );

  console.log(
    "SERVICES PAGE - Final categories:",
    categories.map((category) => category.name)
  );

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