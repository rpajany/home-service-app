"use client";
import { useEffect, useMemo, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import CategoryIcon from "@/components/CategoryIcon";
import { categories as demoCategories } from "@/lib/demo-data";

export default function ServiceGrid({ services, initialCategory = "All", initialQuery = "" }) {
  const [category, setCategory] = useState(initialCategory || "All");
  const [query, setQuery] = useState(initialQuery || "");
  const [categories, setCategories] = useState(demoCategories);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setCategories(data.categories?.length ? data.categories : demoCategories))
      .catch(() => setCategories(demoCategories));
  }, []);

  const filtered = useMemo(() => services.filter(s => (category === "All" || s.category === category) && `${s.name} ${s.providerName} ${s.address} ${s.city || ""} ${s.category || ""} ${s.description || ""}`.toLowerCase().includes(query.toLowerCase())), [services, category, query]);
  return <div className="container-page py-8">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold text-[#7045e8]">Explore services</p><h1 className="text-3xl font-black">Home services near you</h1></div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search services..." className="h-11 w-full rounded-md border border-[#ded9e6] px-4 text-sm outline-none focus:border-[#7045e8] sm:w-72" />
    </div>
    <div className="grid gap-7 lg:grid-cols-[200px_1fr]">
      <aside>
        <p className="mb-3 text-sm font-bold text-[#7045e8]">Categories</p>
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          <button onClick={() => setCategory("All")} className={`flex shrink-0 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold ${category === "All" ? "border-[#7045e8] bg-[#f4efff] text-[#7045e8]" : "border-[#e4e0e8]"}`}>All services</button>
          {categories.map(c => <button key={c._id || c.name} onClick={() => setCategory(c.name)} className={`flex shrink-0 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold ${category === c.name ? "border-[#7045e8] bg-[#f4efff] text-[#7045e8]" : "border-[#e4e0e8]"}`}><CategoryIcon name={c.icon || c.name} size={21}/>{c.name}</button>)}
        </div>
      </aside>
      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">{category === "All" ? "All services" : category}</h2><span className="text-sm text-[#898591]">{filtered.length} services</span></div>
        {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{filtered.map(s => <ServiceCard key={s._id} service={s}/>)}</div> : <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No services found.</div>}
      </section>
    </div>
  </div>;
}
