"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { formatTime } from "@/lib/utils";

function toDateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function addressTitle(address) { return address?.label === "Others" && address?.customLabel ? address.customLabel : address?.label || "Address"; }
function addressText(address) { return [address?.addressLine1, address?.addressLine2, address?.city, address?.state, address?.pincode, address?.country, address?.gstNumber ? `GST: ${address.gstNumber}` : ""].filter(Boolean).join(", "); }

export default function BookingDialog({ service, open, onOpenChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [date, setDate] = useState(toDateKey(today));
  const [time, setTime] = useState(service?.slots?.[0] || "10:00");
  const [notes, setNotes] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open || !service) return;
    setMessage("");
    setNotes("");
    setTime(service?.slots?.[0] || "10:00");
    setDate(toDateKey(today));
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setAddressLoading(true);
    fetch("/api/auth/profile", { cache: "no-store" })
      .then(async res => {
        const data = await res.json();
        if (res.status === 401) { window.location.href = `/login?next=/services/${service._id}`; return; }
        if (!res.ok) throw new Error(data.error || "Unable to load your addresses.");
        const list = data.user?.serviceAddresses || [];
        setAddresses(list);
        const preferred = list.find(a => a.isDefault) || list[0];
        setAddressId(preferred?.id || "");
      })
      .catch(e => setMessage(e.message))
      .finally(() => setAddressLoading(false));
  }, [open, service]);

  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const first = start.getDay();
    const count = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
    const cells = [];
    for (let i=0;i<first;i++) cells.push(null);
    for (let d=1;d<=count;d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);

  async function book() {
    if (!addressId) { setMessage("Please select a service address before booking."); return; }
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ serviceId: service._id, date, time, notes, addressId }) });
      const data = await res.json();
      if (res.status === 401) { window.location.href = `/login?next=/services/${service._id}`; return; }
      if (!res.ok) { setMessage(data.error || "Unable to create booking"); setLoading(false); return; }
      setMessage("Booking confirmed successfully!");
      setTimeout(() => { onOpenChange(false); window.location.href = "/bookings"; }, 700);
    } catch { setMessage("Unable to create booking. Please try again."); setLoading(false); }
  }

  if (!service) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogClose onClick={() => onOpenChange(false)}/>
    <h2 className="text-2xl font-black">Book a Service</h2>
    <p className="mt-1 text-sm text-[#777481]">Select date, time and the address where you need <b>{service.name}</b>.</p>

    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-3"><div><p className="font-bold">Service Address</p><p className="text-xs text-gray-500">Choose where the provider should visit.</p></div><Link href="/profile" className="inline-flex items-center gap-1 text-xs font-bold text-[#7045e8] hover:underline"><Plus size={14}/>Manage addresses</Link></div>
      {addressLoading ? <div className="rounded-xl border p-4 text-sm text-gray-500">Loading your saved addresses...</div> : addresses.length ? <div className="grid gap-2 sm:grid-cols-2">{addresses.map(address => <button key={address.id} type="button" onClick={() => setAddressId(address.id)} className={`text-left rounded-xl border p-3 transition ${addressId === address.id ? "border-[#7045e8] bg-[#f6f1ff] ring-1 ring-[#7045e8]" : "border-[#e5e1e9] hover:border-[#b9a4f1]"}`}><div className="flex items-center gap-2"><MapPin size={16} className="text-[#7045e8]"/><span className="font-bold">{addressTitle(address)}</span>{address.isDefault && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#7045e8]">Default</span>}</div><p className="mt-2 text-xs leading-5 text-gray-600">{addressText(address)}</p></button>)}</div> : <div className="rounded-xl border border-dashed p-5 text-center"><p className="text-sm font-semibold">No saved service addresses.</p><p className="mt-1 text-xs text-gray-500">Add Home, Office or Others in your Profile first.</p><Link href="/profile" className="mt-3 inline-block"><Button size="sm"><Plus size={15} className="mr-1"/>Add Address</Button></Link></div>}
    </div>

    <div className="mt-6"><p className="mb-3 font-bold">Select Date</p>
      <div className="rounded-xl border border-[#e5e1e9] p-4">
        <div className="mb-4 flex items-center justify-between"><button type="button" className="rounded-md p-2 hover:bg-gray-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))}><ChevronLeft/></button><b>{month.toLocaleString("en-US", {month:"long", year:"numeric"})}</b><button type="button" className="rounded-md p-2 hover:bg-gray-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))}><ChevronRight/></button></div>
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8b8793]">{["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <span key={d} className="py-2">{d}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">{days.map((d,i) => <button type="button" key={i} disabled={!d || d < today} onClick={() => d && setDate(toDateKey(d))} className={`h-10 rounded-md text-sm ${!d ? "invisible" : d < today ? "text-gray-300" : date === toDateKey(d) ? "bg-[#7045e8] font-bold text-white" : "hover:bg-[#f4efff]"}`}>{d?.getDate()}</button>)}</div>
      </div>
    </div>
    <div className="mt-6"><p className="mb-3 font-bold">Select Time Slot</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{service.slots.map(slot => <button type="button" key={slot} onClick={() => setTime(slot)} className={`flex items-center justify-center gap-1 rounded-full border px-3 py-2.5 text-sm ${time === slot ? "border-[#7045e8] bg-[#f4efff] font-bold text-[#7045e8]" : "border-[#e5e1e9] hover:border-[#7045e8]"}`}><Clock size={14}/>{formatTime(slot)}</button>)}</div></div>
    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for the service provider (optional)" className="mt-5 min-h-20 w-full rounded-md border border-[#ded9e6] p-3 text-sm outline-none focus:border-[#7045e8]"/>
    {message && <p className={`mt-3 text-sm font-semibold ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
    <Button onClick={book} disabled={loading || addressLoading || !addresses.length} className="mt-5 w-full">{loading ? "Booking..." : `Confirm Booking • ${formatTime(time)}`}</Button>
  </DialogContent></Dialog>;
}
