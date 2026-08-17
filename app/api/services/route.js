import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { demoServices } from "@/lib/demo-data";

function serializeService(service) {
  return {
    ...service,

    // MongoDB ObjectId -> string
    _id:
      service?._id !== undefined &&
      service?._id !== null
        ? String(service._id)
        : "",

    // Make sure all normal fields are primitive values
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

    email: service?.email
      ? String(service.email)
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

    // Gallery
    gallery: Array.isArray(service?.gallery)
      ? service.gallery.map((item) => String(item))
      : [],

    // Numbers
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

    // Availability
    availableFrom: service?.availableFrom
      ? String(service.availableFrom)
      : "",

    availableTo: service?.availableTo
      ? String(service.availableTo)
      : "",

    // Slots
    slots: Array.isArray(service?.slots)
      ? service.slots.map((slot) => String(slot))
      : [],

    status: service?.status
      ? String(service.status)
      : "",

    // Dates -> strings
    createdAt: service?.createdAt
      ? new Date(service.createdAt).toISOString()
      : null,

    updatedAt: service?.updatedAt
      ? new Date(service.updatedAt).toISOString()
      : null,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const category = (
    searchParams.get("category") || ""
  ).trim();

  const exclude = (
    searchParams.get("exclude") || ""
  ).trim();

  const search = (
    searchParams.get("search") || ""
  ).trim();

  try {
    await connectDB();

    const query = {};

    /*
     * CATEGORY FILTER
     *
     * Example:
     * /api/services?category=Carpenter
     *
     * Case insensitive exact match.
     */
    if (category) {
      const escapedCategory = category.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      query.category = {
        $regex: `^${escapedCategory}$`,
        $options: "i",
      };
    }

    /*
     * EXCLUDE SERVICE
     */
    if (exclude) {
      query._id = {
        $ne: exclude,
      };
    }

    /*
     * SEARCH
     */
    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      query.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          category: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          providerName: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          address: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          city: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    /*
     * GET SERVICES
     *
     * .lean() returns plain objects instead of
     * full Mongoose documents.
     */
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .lean();

    /*
     * IMPORTANT:
     *
     * Convert MongoDB ObjectId and Date values
     * into normal JSON-safe values.
     */
    const serializedServices = services.map(
      serializeService
    );

    /*
     * If database has services, return them.
     *
     * If category/search was requested and there
     * are no matches, return [] instead of demo data.
     */
    if (
      serializedServices.length ||
      category ||
      search
    ) {
      return NextResponse.json({
        services: serializedServices,
      });
    }

    /*
     * No DB services and no filter:
     * return demo services as fallback.
     */
    return NextResponse.json({
      services: demoServices.map(serializeService),
    });
  } catch (error) {
    console.error(
      "Services API error:",
      error
    );

    /*
     * Fallback to demo data if MongoDB/API fails.
     */
    let services = demoServices;

    /*
     * CATEGORY FILTER
     */
    if (category) {
      services = services.filter(
        (service) =>
          String(service.category || "")
            .trim()
            .toLowerCase() ===
          category.toLowerCase()
      );
    }

    /*
     * EXCLUDE
     */
    if (exclude) {
      services = services.filter(
        (service) =>
          String(service._id || "") !== exclude
      );
    }

    /*
     * SEARCH
     */
    if (search) {
      const q = search.toLowerCase();

      services = services.filter((service) => {
        const text = [
          service.name,
          service.category,
          service.providerName,
          service.address,
          service.city,
          service.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(q);
      });
    }

    return NextResponse.json({
      services: services.map(serializeService),
    });
  }
}