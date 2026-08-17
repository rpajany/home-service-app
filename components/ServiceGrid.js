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
  const [category, setCategory] = useState(initialCategory || "All");
  const [query, setQuery] = useState(initialQuery || "");

  const categories = initialCategories?.length
    ? initialCategories
    : demoCategories;

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
    <div className="container-page w-full min-w-0 max-w-full overflow-x-hidden py-8">

      {/* HEADER */}
      <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
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
          className="h-11 w-full max-w-full rounded-md border border-[#ded9e6] px-4 text-sm outline-none focus:border-[#7045e8] sm:w-72"
        />
      </div>

      {/* CONTENT */}
      <div className="grid w-full min-w-0 max-w-full gap-7 lg:grid-cols-[200px_minmax(0,1fr)]">

        {/* CATEGORIES */}
        <aside className="min-w-0 max-w-full">
          <p className="mb-3 text-sm font-bold text-[#7045e8]">
            Categories
          </p>

          <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto lg:flex-col">
            {/* ALL */}
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

            {/* CATEGORIES */}
            {categories.map((c) => {
              const categoryName = String(c.name || "").trim();

              if (!categoryName) return null;

              const isSelected =
                normalize(category) === normalize(categoryName);

              return (
                <button
                  key={c._id || c.slug || categoryName}
                  type="button"
                  onClick={() => setCategory(categoryName)}
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

        {/* SERVICES */}
        <section className="min-w-0 w-full max-w-full">

          <div className="mb-4 flex min-w-0 items-center justify-between">
            <h2 className="text-xl font-black">
              {normalize(category) === "all"
                ? "All services"
                : category}
            </h2>

            <span className="shrink-0 text-sm text-[#898591]">
              {filtered.length} services
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid w-full min-w-0 max-w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filtered.map((service) => (
                <div
                  key={service._id}
                  className="min-w-0 max-w-full"
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-full rounded-xl border border-dashed p-10 text-center text-gray-500">
              No services found.
            </div>
          )}

        </section>
      </div>
    </div>
  );
}