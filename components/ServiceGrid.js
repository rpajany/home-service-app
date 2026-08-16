"use client";

import { useEffect, useMemo, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import CategoryIcon from "@/components/CategoryIcon";
import { categories as demoCategories } from "@/lib/demo-data";

export default function ServiceGrid({
  services = [],
  initialCategory = "All",
  initialQuery = "",
}) {
  const [category, setCategory] = useState(initialCategory || "All");
  const [query, setQuery] = useState(initialQuery || "");
  const [categories, setCategories] = useState(demoCategories);

  // Load categories
  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject(new Error("Category API failed"))
      )
      .then((data) => {
        setCategories(
          data.categories?.length
            ? data.categories
            : demoCategories
        );
      })
      .catch((error) => {
        console.error("Categories API error:", error);
        setCategories(demoCategories);
      });
  }, []);

  // Filter services
  const filtered = useMemo(() => {
    const selectedCategory = String(category || "All")
      .trim()
      .toLowerCase();

    const searchQuery = String(query || "")
      .trim()
      .toLowerCase();

    return services.filter((s) => {
      const serviceCategory = String(s.category || "")
        .trim()
        .toLowerCase();

      const matchesCategory =
        selectedCategory === "all" ||
        serviceCategory === selectedCategory;

      const searchText = `
        ${s.name || ""}
        ${s.providerName || ""}
        ${s.address || ""}
        ${s.city || ""}
        ${s.category || ""}
        ${s.description || ""}
      `.toLowerCase();

      const matchesQuery = searchText.includes(searchQuery);

      return matchesCategory && matchesQuery;
    });
  }, [services, category, query]);

  return (
    <div className="container-page py-8">

      {/* Header */}
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

      <div className="grid gap-7 lg:grid-cols-[200px_1fr]">

        {/* Categories */}
        <aside>
          <p className="mb-3 text-sm font-bold text-[#7045e8]">
            Categories
          </p>

          <div className="flex gap-2 overflow-x-auto lg:flex-col">

            {/* All */}
            <button
              onClick={() => setCategory("All")}
              className={`flex shrink-0 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold ${
                String(category).trim().toLowerCase() === "all"
                  ? "border-[#7045e8] bg-[#f4efff] text-[#7045e8]"
                  : "border-[#e4e0e8]"
              }`}
            >
              All services
            </button>

            {/* Categories */}
            {categories.map((c) => {
              const isSelected =
                String(category || "")
                  .trim()
                  .toLowerCase() ===
                String(c.name || "")
                  .trim()
                  .toLowerCase();

              return (
                <button
                  key={c._id || c.name}
                  onClick={() => setCategory(c.name)}
                  className={`flex shrink-0 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold ${
                    isSelected
                      ? "border-[#7045e8] bg-[#f4efff] text-[#7045e8]"
                      : "border-[#e4e0e8]"
                  }`}
                >
                  <CategoryIcon
                    name={c.icon || c.name}
                    size={21}
                  />

                  {c.name}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Services */}
        <section>
          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-black">
              {String(category).trim().toLowerCase() === "all"
                ? "All services"
                : category}
            </h2>

            <span className="text-sm text-[#898591]">
              {filtered.length} services
            </span>
          </div>

          {filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filtered.map((s) => (
                <ServiceCard
                  key={s._id}
                  service={s}
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