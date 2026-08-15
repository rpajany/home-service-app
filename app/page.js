import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import ServiceCard from "@/components/ServiceCard";
import { demoServices } from "@/lib/demo-data";
import { getActiveCategories } from "@/lib/category-data";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";

async function getHomeServices() {
  try {
    await connectDB();
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    return services.length ? services : demoServices;
  } catch {
    return demoServices;
  }
}

export default async function HomePage() {
  const [categories, services] = await Promise.all([getActiveCategories(), getHomeServices()]);
  const popular = [];
  const seen = new Set();
  for (const category of categories) {
    const service = services.find(s => String(s.category || "").toLowerCase() === String(category.name || "").toLowerCase());
    if (service && !seen.has(service._id?.toString())) {
      popular.push(service);
      seen.add(service._id?.toString());
    }
  }

  return <main>
    <section className="container-page pb-10 pt-14 text-center md:pt-16">
      <h1 className="hero-title mx-auto max-w-3xl text-4xl font-black leading-tight md:text-5xl">Find Home <span className="brand-gradient">Service/Repair</span><br/>Near You</h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-[#8a8791]">Explore Best Home Service &amp; Repair near you</p>
      <form action="/services" method="get" className="mx-auto mt-6 flex max-w-xl items-center rounded-full border border-[#e1dce8] bg-white p-1.5 shadow-sm">
        <input name="search" className="h-10 flex-1 bg-transparent px-4 text-sm outline-none" placeholder="Search services, providers or location..." aria-label="Search services" />
        <button type="submit" aria-label="Search" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7045e8] text-white hover:bg-[#5b32cf]"><Search size={19}/></button>
      </form>
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2 sm:grid-cols-6">{categories.map(c => <Link key={c._id || c.name} href={`/services?category=${encodeURIComponent(c.name)}`} className="flex h-[76px] flex-col items-center justify-center gap-1 rounded-md bg-[#f7f1ff] text-[#7045e8] transition hover:-translate-y-1 hover:shadow"><CategoryIcon name={c.icon || c.name}/><span className="text-xs font-semibold">{c.name}</span></Link>)}</div>
    </section>
    <section className="container-page pb-10"><div className="mb-5 flex items-end justify-between"><h2 className="text-xl font-black">Popular Business</h2><Link href="/services" className="flex items-center gap-1 text-sm font-semibold text-[#7045e8]">View all <ArrowRight size={16}/></Link></div>
      {popular.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{popular.map(s => <ServiceCard key={s._id?.toString() || s.slug} service={s}/>)}</div> : <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">No services available yet.</div>}
    </section>
    <section className="container-page rounded-2xl bg-[#f7f3ff] px-6 py-10 text-center"><h2 className="text-2xl font-black">Need a reliable professional?</h2><p className="mx-auto mt-2 max-w-xl text-sm text-[#777481]">Compare local services, choose a time that works for you and book in a few clicks.</p><Link href="/services"><button className="mt-5 rounded-md bg-[#7045e8] px-6 py-3 text-sm font-bold text-white">Explore Services</button></Link></section>
  </main>;
}
