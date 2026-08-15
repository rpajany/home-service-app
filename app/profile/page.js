"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMPTY_ADDRESS = { id: "", label: "Home", customLabel: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", country: "India", gstNumber: "", isDefault: false };
function addressTitle(a) { return a.label === "Others" && a.customLabel ? a.customLabel : a.label; }
function addressText(a) { return [a.addressLine1, a.addressLine2, a.city, a.state, a.pincode, a.country, a.gstNumber ? `GST: ${a.gstNumber}` : ""].filter(Boolean).join(", "); }
function newTempId() { return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `tmp-${Date.now()}-${Math.random()}`; }

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/profile", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Please sign in.");
      setUser(d.user);
      setForm({ name: d.user.name || "", phone: d.user.phone || "" });
      setAddresses(d.user.serviceAddresses || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadProfile(); }, []);

  function set(key, value) { setForm(f => ({ ...f, [key]: value })); }
  function openAddAddress() {
    setEditingAddressId(null);
    setAddressForm({ ...EMPTY_ADDRESS, id: newTempId(), isDefault: addresses.length === 0 });
    setShowAddressForm(true); setError(""); setMessage("");
  }
  function openEditAddress(address) {
    setEditingAddressId(address.id);
    setAddressForm({ ...EMPTY_ADDRESS, ...address });
    setShowAddressForm(true); setError(""); setMessage("");
  }
  function removeAddress(id) {
    if (!window.confirm("Delete this service address? Existing bookings will keep their saved address.")) return;
    const remaining = addresses.filter(a => a.id !== id);
    if (remaining.length && !remaining.some(a => a.isDefault)) remaining[0] = { ...remaining[0], isDefault: true };
    setAddresses(remaining);
    if (editingAddressId === id) setShowAddressForm(false);
  }
  function setDefaultAddress(id) {
    setAddresses(list => list.map(a => ({ ...a, isDefault: a.id === id })));
  }
  function saveAddressLocal(e) {
    e.preventDefault();
    const a = { ...addressForm };
    if (!a.addressLine1.trim() || !a.city.trim() || !a.state.trim() || !a.pincode.trim()) {
      setError("Address Line 1, City, State and PIN Code are required."); return;
    }
    if (a.label === "Others" && !a.customLabel.trim()) {
      setError("Please enter a name for the Others address, such as Parent House or Site."); return;
    }
    setAddresses(list => {
      let next = editingAddressId
        ? list.map(item => item.id === editingAddressId ? a : item)
        : [...list, a];
      if (a.isDefault) {
        next = next.map(item => ({ ...item, isDefault: item.id === a.id }));
      } else if (!next.some(item => item.isDefault) && next.length) {
        next = next.map((item, index) => ({ ...item, isDefault: index === 0 }));
      }
      return next;
    });
    setShowAddressForm(false); setMessage("Address added to your profile. Click Save Changes to store it."); setError("");
  }

  async function save(e) {
    e.preventDefault(); setSaving(true); setMessage(""); setError("");
    try {
      const payload = { name: form.name, phone: form.phone, serviceAddresses: addresses };
      const r = await fetch("/api/auth/profile", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to update profile.");
      setUser(d.user); setForm({ name: d.user.name || "", phone: d.user.phone || "" }); setAddresses(d.user.serviceAddresses || []);
      setMessage("Profile and service addresses updated successfully.");
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="container-page py-16"><div className="mx-auto max-w-4xl animate-pulse rounded-2xl border bg-white p-8"><div className="h-8 w-40 rounded bg-gray-100"/><div className="mt-8 h-11 rounded bg-gray-100"/><div className="mt-4 h-32 rounded bg-gray-100"/></div></main>;
  if (error && !user) return <main className="container-page py-16"><div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-black">Profile unavailable</h1><p className="mt-2 text-sm text-[#777481]">{error}</p><Link href="/login" className="mt-6 inline-block"><Button>Sign In</Button></Link></div></main>;
  const initials=user?.name?.split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"U";

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-4 py-10"><div className="mx-auto max-w-4xl"><Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6d42d7] hover:underline"><ArrowLeft size={16}/> Back to home</Link><section className="overflow-hidden rounded-2xl border border-[#e7e3ed] bg-white shadow-sm"><div className="bg-gradient-to-r from-[#f4efff] to-white px-6 py-8 sm:px-8"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#064b3d] text-xl font-bold text-white">{initials}</div><div><h1 className="text-2xl font-black">My Profile</h1><p className="mt-1 text-sm text-[#777481]">Manage your contact information and saved service addresses.</p></div></div></div>
    <form onSubmit={save} className="space-y-8 p-6 sm:p-8">
      <div><h2 className="text-lg font-black">Personal Details</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold">Full name</label><Input value={form.name} onChange={e=>set("name",e.target.value)} required /></div><div><label className="mb-2 block text-sm font-semibold">Phone</label><Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="Enter phone number" /></div><div className="md:col-span-2"><label className="mb-2 block text-sm font-semibold">Email</label><Input value={user.email} readOnly className="bg-[#f8f7fa]"/><p className="mt-1 text-xs text-[#88838f]">Email changes are disabled for account security.</p></div></div></div>

      <div className="border-t pt-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><MapPin size={20} className="text-[#7045e8]"/><div><h2 className="text-lg font-black">Service Addresses</h2><p className="text-xs text-gray-500">Save multiple places and choose one each time you book.</p></div></div><Button type="button" onClick={openAddAddress}><Plus size={16} className="mr-1"/> Add Address</Button></div>
        {addresses.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{addresses.map(address => <article key={address.id} className={`rounded-xl border p-4 ${address.isDefault ? "border-[#7045e8] bg-[#faf7ff]" : "bg-white"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="font-black">{addressTitle(address)}</span>{address.isDefault && <span className="rounded-full bg-[#7045e8] px-2 py-0.5 text-[10px] font-bold text-white">Default</span>}</div><p className="mt-2 text-sm leading-6 text-gray-600">{addressText(address)}</p></div><div className="flex shrink-0 gap-1"><button type="button" title="Edit" onClick={()=>openEditAddress(address)} className="rounded-lg p-2 hover:bg-white"><Pencil size={16}/></button><button type="button" title="Delete" onClick={()=>removeAddress(address.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button></div></div>{!address.isDefault && <button type="button" onClick={()=>setDefaultAddress(address.id)} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#7045e8] hover:underline"><Star size={14}/> Make default</button>}</article>)}</div> : <div className="mt-5 rounded-xl border border-dashed p-8 text-center"><MapPin className="mx-auto text-gray-300" size={30}/><p className="mt-2 font-bold">No service addresses saved</p><p className="mt-1 text-sm text-gray-500">Add Home, Office or Others before booking a service.</p><Button type="button" className="mt-4" onClick={openAddAddress}><Plus size={16} className="mr-1"/> Add Your First Address</Button></div>}
      </div>

      {showAddressForm && <div className="rounded-2xl border border-[#ded7ea] bg-[#fbf9ff] p-5"><div className="flex items-center justify-between"><div><h3 className="font-black">{editingAddressId ? "Edit Service Address" : "Add Service Address"}</h3><p className="mt-1 text-xs text-gray-500">Choose a label so you can quickly select this address while booking.</p></div><button type="button" onClick={()=>setShowAddressForm(false)} className="rounded-full p-2 hover:bg-white"><X size={18}/></button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold">Address Type<select value={addressForm.label} onChange={e=>setAddressForm(f=>({...f,label:e.target.value}))} className="field"><option>Home</option><option>Office</option><option>Others</option></select></label>{addressForm.label === "Others" ? <label className="text-sm font-semibold">Custom Name<Input value={addressForm.customLabel} onChange={e=>setAddressForm(f=>({...f,customLabel:e.target.value}))} placeholder="Parent House / Site / Shop" /></label> : <div/>}<label className="md:col-span-2 text-sm font-semibold">Address Line 1 *<Input value={addressForm.addressLine1} onChange={e=>setAddressForm(f=>({...f,addressLine1:e.target.value}))} placeholder="House / Flat / Street" required /></label><label className="md:col-span-2 text-sm font-semibold">Address Line 2<Input value={addressForm.addressLine2} onChange={e=>setAddressForm(f=>({...f,addressLine2:e.target.value}))} placeholder="Apartment, landmark, area (optional)" /></label><label className="text-sm font-semibold">City *<Input value={addressForm.city} onChange={e=>setAddressForm(f=>({...f,city:e.target.value}))} required /></label><label className="text-sm font-semibold">State *<Input value={addressForm.state} onChange={e=>setAddressForm(f=>({...f,state:e.target.value}))} required /></label><label className="text-sm font-semibold">PIN Code *<Input value={addressForm.pincode} onChange={e=>setAddressForm(f=>({...f,pincode:e.target.value}))} required /></label><label className="text-sm font-semibold">Country<Input value={addressForm.country} onChange={e=>setAddressForm(f=>({...f,country:e.target.value}))} /></label><label className="md:col-span-2 text-sm font-semibold">GST Number<Input value={addressForm.gstNumber} onChange={e=>setAddressForm(f=>({...f,gstNumber:e.target.value.toUpperCase()}))} placeholder="GST Number (Optional)" maxLength={30} /></label><label className="md:col-span-2 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={addressForm.isDefault} onChange={e=>setAddressForm(f=>({...f,isDefault:e.target.checked}))} /> Use this as my default booking address</label></div><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={()=>setShowAddressForm(false)}>Cancel</Button><Button type="button" onClick={saveAddressLocal}>{editingAddressId ? "Update Address" : "Add Address"}</Button></div></div>}

      {message&&<p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"><CheckCircle2 size={16}/>{message}</p>}{error&&<p className="text-sm font-semibold text-red-600">{error}</p>}
      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end"><Link href="/bookings"><Button type="button" variant="outline" className="w-full sm:w-auto">My Bookings</Button></Link><Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving?"Saving...":"Save Profile & Addresses"}</Button></div>
    </form></section></div></main>;
}
