"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Clock, Mail, MapPin, Share2, UserRound, Star } from "lucide-react";
import { demoServices } from "@/lib/demo-data";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState(null); const [similar, setSimilar] = useState([]); const [open, setOpen] = useState(false);
  useEffect(() => { (async () => {
    const id = params.id;
    const found = demoServices.find(s => s._id === id || s.slug === id);
    try {
      const r = await fetch(`/api/services/${id}`, { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setService(data.service);
        const category = encodeURIComponent(data.service?.category || "");
        const sr = await fetch(`/api/services?category=${category}&exclude=${encodeURIComponent(data.service?._id || "")}`, { cache: "no-store" });
        if (sr.ok) setSimilar((await sr.json()).services?.slice(0, 3) || []);
        return;
      }
    } catch {}
    const current = found || demoServices[0];
    setService(current);
    setSimilar(demoServices.filter(s => s.category === current.category && s._id !== current._id).slice(0,3));
  })(); }, [params.id]);
  if (!service) return <div className="container-page py-20 text-center">Loading service...</div>;
  return <main className="container-page py-12">
    <section className="grid items-center gap-8 md:grid-cols-[1fr_1.7fr]">
      <div className="relative h-64 overflow-hidden rounded-full md:h-72 md:rounded-full"><Image src={service.image} alt={service.name} fill className="object-cover" sizes="400px"/></div>
      <div><div className="flex flex-wrap items-center justify-between gap-4"><span className="rounded-full bg-[#eee5ff] px-3 py-1.5 text-sm font-semibold text-[#6d42d7]">{service.category}</span><button className="rounded-md bg-[#7045e8] p-3 text-white" onClick={() => navigator.share?.({title:service.name,url:location.href})}><Share2 size={18}/></button></div><h1 className="mt-3 text-4xl font-black">{service.name}</h1><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#66616f]"><span className="flex items-center gap-2"><MapPin size={18}/>{service.address}</span><span className="flex items-center gap-2"><Mail size={18}/>{service.email || "support@example.com"}</span></div><div className="mt-5 flex flex-wrap items-center gap-6 text-sm"><span className="flex items-center gap-2 text-[#6d42d7]"><UserRound size={18}/>{service.providerName}</span><span className="flex items-center gap-1"><Star size={17} fill="#f0a500" className="text-[#f0a500]"/>{service.rating} ({service.reviews} reviews)</span><span className="flex items-center gap-2"><Clock size={18}/>Available {service.availableFrom} to {service.availableTo}</span></div></div>
    </section>
    <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
      <div><h2 className="text-xl font-black">Description</h2><p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#5f5a67]">{service.description}</p><h2 className="mt-10 text-xl font-black">Gallery</h2><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">{[0,1,2].map(i => <div key={i} className="relative h-40 overflow-hidden rounded-xl"><Image src={service.image} alt="gallery" fill className="object-cover" style={{opacity: 1-i*.15}}/></div>)}</div></div>
      <aside><Button className="w-full" onClick={() => setOpen(true)}><CalendarDays size={18} className="mr-2"/>Book Appointment</Button><h3 className="mt-6 text-base font-black">Similar Business</h3>{similar.length ? <div className="mt-3 space-y-3">{similar.map(s => <Link href={`/services/${s.slug || s._id}`} key={s._id} className="flex gap-3 rounded-lg border p-2 hover:bg-[#faf8ff]"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={s.image} alt={s.name} fill className="object-cover"/></div><div><p className="text-sm font-bold">{s.name}</p><p className="text-xs text-[#6d42d7]">{s.providerName}</p><p className="mt-1 text-xs text-gray-500">{s.address}</p></div></Link>)}</div> : <p className="mt-3 text-sm text-gray-500">No other {service.category} services available yet.</p>}</aside>
    </section>
    <BookingDialog service={service} open={open} onOpenChange={setOpen}/>
  </main>;
}
