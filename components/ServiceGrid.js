"use client";

import { useMemo, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import CategoryIcon from "@/components/CategoryIcon";
import { categories as demoCategories } from "@/lib/demo-data";

export default function ServiceGrid({
  services = [],
  categories: initialCategories = [],
  initialCategory = "All",
  initialQuery = "",
}) {
  const [category, setCategory] = useState(
    initialCategory || "All"
  );

  const [query, setQuery] = useState(
    initialQuery || ""
  );

  /*
   * Categories are now received directly from the server.
   *
   * No useEffect()
   * No browser API request
   * No delayed category rendering
   */
  const categories =
    initialCategories?.length
      ? initialCategories
      : demoCategories;

  /*
   * Normalize a value so that:
   *
   * "Carpenter"
   * "carpenter"
   * " Carpenter "
   *
   * are treated as the same category.
   */
  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const filtered = useMemo(() => {
    const selectedCategory = normalize(category);
    const searchQuery = normalize(query);

    return services.filter((service) => {
      const serviceCategory = normalize(service.category);

      const matchesCategory =
        selectedCategory === "all" ||
        serviceCategory === selectedCategory;

      const searchText = [
        service.name,
        service.providerName,
        service.address,
        service.city,
        service.category,
        service.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !searchQuery ||
        searchText.includes(searchQuery);

      return matchesCategory && matchesQuery;
    });
  }, [services, category, query]);

  return (
    <div className="container-page py-8">

      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#7045e8]">
            Explore services
          </p>

          <h1 className="text-3xl font-black">
            Home services near you
          </h1>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services..."
          className="h-11 w-full rounded-md border border-[#ded9e6] px-4 text-sm outline-none focus:border-[#7045e8] sm:w-72"
        />
      </div>

      {/* =========================
          CONTENT
      ========================= */}
      <div className="grid gap-7 lg:grid-cols-[200px_1fr]">

        {/* =========================
            CATEGORIES
        ========================= */}
        <aside>
          <p className="mb-3 text-sm font-bold text-[#7045e8]">
            Categories
          </p>

          <div className="flex gap-2 overflow-x-auto lg:flex-col">

            {/* ALL SERVICES */}
            <button
              type="button"
              onClick={() => setCategory("All")}
              className={`flex shrink-0 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold ${
                normalize(category) === "all"
                  ? "border-[#7045e8] bg-[#f4efff] text-[#7045e8]"
                  : "border-[#e4e0e8]"
              }`}
            >
              All services
            </button>

            {/* DATABASE CATEGORIES */}
            {categories.map((c) => {
              const categoryName = String(
                c.name || ""
              ).trim();

              if (!categoryName) {
                return null;
              }

              const isSelected =
                normalize(category) ===
                normalize(categoryName);

              return (
                <button
                  key={c._id || c.slug || categoryName}
                  type="button"
                  onClick={() =>
                    setCategory(categoryName)
                  }
                  className={`flex shrink-0 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold ${
                    isSelected
                      ? "border-[#7045e8] bg-[#f4efff] text-[#7045e8]"
                      : "border-[#e4e0e8]"
                  }`}
                >
                  <CategoryIcon
                    name={c.icon || categoryName}
                    size={21}
                  />

                  {categoryName}
                </button>
              );
            })}
          </div>
        </aside>

        {/* =========================
            SERVICES
        ========================= */}
        <section>

          {/* SECTION HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">
              {normalize(category) === "all"
                ? "All services"
                : category}
            </h2>

            <span className="text-sm text-[#898591]">
              {filtered.length} services
            </span>
          </div>

          {/* SERVICE CARDS */}
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filtered.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
              No services found.
            </div>
          )}

        </section>
      </div>
    </div>
  );
}