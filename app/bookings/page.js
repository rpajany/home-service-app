"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, UserRound, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";

const statusStyles = {
  Booked: "bg-[#f3edff] text-[#6840d8]",
  Confirmed: "bg-blue-50 text-blue-700",
  Assigned: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-green-50 text-green-700",
  Closed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700"
};

export default function BookingsPage() {
  const [tab, setTab] = useState("Booked");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/bookings", { cache: "no-store" });
    if (res.status === 401) { location.href = "/login?next=/bookings"; return; }
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function cancelBooking(id) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) setBookings(current => current.map(b => b._id === id ? { ...b, status: "Cancelled" } : b));
    setCancelling("");
  }

  const shown = bookings.filter(b => tab === "Booked" ? !["Completed", "Closed", "Cancelled"].includes(b.status) : b.status === "Completed" || b.status === "Closed");

  return <main className="container-page py-10"><h1 className="text-2xl font-black">My Bookings</h1><div className="mt-5 flex border-b bg-[#f7f6f8]"><button onClick={() => setTab("Booked")} className={`px-5 py-3 text-sm font-bold ${tab === "Booked" ? "border-b-2 border-[#7045e8] bg-white" : "text-gray-500"}`}>Booked</button><button onClick={() => setTab("Completed")} className={`px-5 py-3 text-sm font-bold ${tab === "Completed" ? "border-b-2 border-[#7045e8] bg-white" : "text-gray-500"}`}>Completed</button></div>
    {loading ? <p className="py-10 text-gray-500">Loading bookings...</p> : shown.length ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{shown.map(b => <article key={b._id} className="flex gap-4 rounded-lg border bg-white p-3 shadow-sm"><div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg"><Image src={b.service.image} alt={b.service.name} fill className="object-cover"/></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="font-bold">{b.service.name}</h2><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyles[b.status] || "bg-gray-100"}`}>{b.status}</span></div><p className="mt-1 flex items-center gap-2 text-sm text-[#6d42d7]"><UserRound size={16}/>{b.service.providerName}{b.assignedProvider ? ` • ${b.assignedProvider}` : ""}</p><p className="mt-1 flex items-center gap-2 text-sm text-gray-600"><MapPin size={16}/>{b.service.address}</p><p className="mt-1 flex items-center gap-2 text-sm"><CalendarDays size={16}/>Service on : <b>{formatDate(b.date)}</b></p><p className="mt-1 flex items-center gap-2 text-sm"><Clock size={16}/>Service at : <b>{formatTime(b.time)}</b></p><div className="mt-3 rounded-lg border bg-[#faf8fc] px-3 py-2"><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"><span><b>Service Amount:</b> {Number(b.paymentAmount || 0) > 0 ? `₹${Number(b.paymentAmount).toFixed(2)}` : "Not updated yet"}</span>{Number(b.paymentAmount || 0) > 0 && <><span><b>Paid:</b> ₹{Number(b.paidAmount || 0).toFixed(2)}</span><span><b>Balance:</b> ₹{Math.max(0, Number(b.paymentAmount || 0) - Number(b.paidAmount || 0)).toFixed(2)}</span></>}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500"><span>Payment: <b className="text-gray-700">{b.paymentStatus || "Pending"}</b></span>{b.transactionMethod && b.paymentStatus && b.paymentStatus !== "Pending" && <span>Method: {b.transactionMethod}</span>}{b.transactionId && <span>Transaction: {b.transactionId}</span>}</div></div><div className="mt-2 flex gap-2"><Link href={`/services/${b.service._id}`}><Button variant="soft" size="sm">View Service</Button></Link>{!['Completed','Closed','Cancelled'].includes(b.status) && <Button variant="outline" size="sm" onClick={() => cancelBooking(b._id)} disabled={cancelling === b._id}><XCircle size={15} className="mr-1"/>{cancelling === b._id ? "Cancelling..." : "Cancel"}</Button>}</div></div></article>)}</div> : <div className="mt-6 rounded-xl border border-dashed p-12 text-center text-gray-500">No {tab.toLowerCase()} bookings yet.</div>}
  </main>;
}
