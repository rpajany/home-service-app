"use client";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, Clock3, Loader2, Pencil, Plus, Search, Trash2, UserRound, Users, Tags, X, XCircle, BriefcaseBusiness, Download, FileSpreadsheet, MoreVertical, MapPin, CreditCard, IndianRupee, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import CategoryIcon from "@/components/CategoryIcon";

const STATUSES = ["Booked", "Confirmed", "Assigned", "In Progress", "Completed", "Closed", "Cancelled"];
const EMPTY_PROVIDER = { name: "", phone: "", email: "", categories: [], address: "", city: "", status: "Available", experience: 0, notes: "" };
const EMPTY_CATEGORY = { name: "", slug: "", icon: "Sparkles", color: "#7045e8", description: "", active: true, order: 0 };
const EMPTY_SERVICE = { name: "", slug: "", category: "", providerName: "", address: "", city: "New York", email: "", description: "", image: "/images/house-cleaning.jpg", availableFrom: "08:00", availableTo: "22:00", slots: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "14:00", "15:00", "16:00", "17:00"] };
const ICONS = ["Sparkles", "Wrench", "Paintbrush", "Truck", "Pipette", "Zap", "Home", "Hammer", "Scissors", "Car", "Fan", "Lightbulb", "ShieldCheck", "Settings", "HeartHandshake"];

function statusClass(status) {
  if (status === "Closed" || status === "Completed") return "bg-green-50 text-green-700 border-green-200";
  if (status === "Cancelled") return "bg-red-50 text-red-700 border-red-200";
  if (status === "In Progress") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "Assigned") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-[#f3edff] text-[#6840d8] border-[#ded1ff]";
}

function providerStatusClass(status) {
  if (status === "Available") return "bg-green-50 text-green-700 border-green-200";
  if (status === "Busy") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function categoryStatusClass(active) {
  return active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200";
}

export default function AdminDashboard({ admin }) {
  const [tab, setTab] = useState("calls");
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [providerSearch, setProviderSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [providerModal, setProviderModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [providerForm, setProviderForm] = useState(EMPTY_PROVIDER);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [providerSaving, setProviderSaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState("");
  const [callMenuId, setCallMenuId] = useState("");
  const [addressModal, setAddressModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ paymentAmount: 0, paidAmount: 0, transactionMethod: "Cash", paymentStatus: "Pending", transactionId: "", paymentNotes: "" });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [adminBookingModal, setAdminBookingModal] = useState(false);
  const [adminBookingSaving, setAdminBookingSaving] = useState(false);
  const [adminBookingError, setAdminBookingError] = useState("");
  const [adminBookingForm, setAdminBookingForm] = useState({ customerId: "", serviceId: "", addressId: "", date: "", time: "", notes: "", paymentAmount: 0, paidAmount: 0, transactionMethod: "Cash", paymentStatus: "Pending", transactionId: "", paymentNotes: "" });
  const [newCustomerMode, setNewCustomerMode] = useState(false);
  const [newCustomerSaving, setNewCustomerSaving] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: "", email: "", phone: "", label: "Home", customLabel: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", country: "India", gstNumber: "" });

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load service calls");
      setBookings(data.bookings || []); setError("");
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  async function loadProviders() {
    setProvidersLoading(true);
    try {
      const res = await fetch("/api/admin/providers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load providers");
      setProviders(data.providers || []); setProviderError("");
    } catch (e) { setProviderError(e.message); } finally { setProvidersLoading(false); }
  }

  async function loadServices() {
    setServicesLoading(true);
    try { const res=await fetch("/api/admin/services",{cache:"no-store"}); const data=await res.json(); if(!res.ok)throw new Error(data.error||"Unable to load services"); setServices(data.services||[]); setServiceError(""); }
    catch(e){setServiceError(e.message);} finally{setServicesLoading(false);}
  }

  async function loadCustomers() {
    setCustomersLoading(true);
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load customers");
      setCustomers(data.customers || []);
    } catch (e) { setAdminBookingError(e.message); } finally { setCustomersLoading(false); }
  }

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load categories");
      setCategories(data.categories || []); setCategoryError("");
    } catch (e) { setCategoryError(e.message); } finally { setCategoriesLoading(false); }
  }

  useEffect(() => { loadBookings(); loadProviders(); loadCategories(); loadServices(); loadCustomers(); }, []);

  async function updateBooking(id, patch) {
    setSaving(id); setError("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update service call");
      setBookings(current => current.map(item => item._id === id ? data.booking : item));
    } catch (e) { setError(e.message); } finally { setSaving(""); }
  }

  function todayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  function openAdminBooking() {
    const customer = customers[0];
    const service = services[0];
    const address = customer?.serviceAddresses?.find(a => a.isDefault) || customer?.serviceAddresses?.[0];
    setCustomerSearch("");
    setNewCustomerMode(false);
    setNewCustomerForm({ name: "", email: "", phone: "", label: "Home", customLabel: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", country: "India", gstNumber: "" });
    setAdminBookingError("");
    setAdminBookingForm({ customerId: customer?.id || "", serviceId: service?._id || "", addressId: address?.id || "", date: todayKey(), time: service?.slots?.[0] || "10:00", notes: "", paymentAmount: 0, paidAmount: 0, transactionMethod: "Cash", paymentStatus: "Pending", transactionId: "", paymentNotes: "" });
    setAdminBookingModal(true);
  }
  function selectAdminCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    const address = customer?.serviceAddresses?.find(a => a.isDefault) || customer?.serviceAddresses?.[0];
    setAdminBookingForm(f => ({ ...f, customerId, addressId: address?.id || "" }));
  }
  function selectAdminService(serviceId) {
    const service = services.find(s => s._id === serviceId);
    setAdminBookingForm(f => ({ ...f, serviceId, time: service?.slots?.[0] || "10:00" }));
  }
  async function saveNewCustomer() {
    setNewCustomerSaving(true); setAdminBookingError("");
    try {
      const res = await fetch("/api/admin/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCustomerForm.name, email: newCustomerForm.email, phone: newCustomerForm.phone, address: newCustomerForm }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create customer");
      const created = data.customer;
      setCustomers(current => [...current, created].sort((a,b) => a.name.localeCompare(b.name)));
      setAdminBookingForm(f => ({ ...f, customerId: created.id, addressId: created.serviceAddresses?.[0]?.id || "" }));
      setCustomerSearch(created.name);
      setNewCustomerMode(false);
      setAdminBookingError("");
    } catch (e) { setAdminBookingError(e.message); } finally { setNewCustomerSaving(false); }
  }

  async function saveAdminBooking(e) {
    e.preventDefault();
    setAdminBookingSaving(true); setAdminBookingError("");
    try {
      const res = await fetch("/api/admin/bookings/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(adminBookingForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create booking");
      setBookings(current => [data.booking, ...current]);
      setAdminBookingModal(false);
    } catch (e) { setAdminBookingError(e.message); } finally { setAdminBookingSaving(false); }
  }

  function openAddressDetails(booking) { setCallMenuId(""); setAddressModal(booking); }
  function openPaymentDetails(booking) { setCallMenuId(""); setPaymentModal(booking); setPaymentForm({ paymentAmount: booking.paymentAmount ?? 0, paidAmount: booking.paidAmount ?? 0, transactionMethod: booking.transactionMethod || "Cash", paymentStatus: booking.paymentStatus || "Pending", transactionId: booking.transactionId || "", paymentNotes: booking.paymentNotes || "" }); }
  async function savePayment(e) { e.preventDefault(); if (!paymentModal) return; setPaymentSaving(true); setError(""); try { const res=await fetch(`/api/admin/bookings/${paymentModal._id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(paymentForm) }); const data=await res.json(); if(!res.ok) throw new Error(data.error||"Unable to update payment details"); setBookings(current=>current.map(item=>item._id===paymentModal._id?data.booking:item)); setPaymentModal(data.booking); } catch(e){setError(e.message);} finally{setPaymentSaving(false);} }

  function openCreateProvider() { setEditingProvider(null); setProviderForm({ ...EMPTY_PROVIDER }); setProviderError(""); setProviderModal(true); }
  function openEditProvider(provider) { setEditingProvider(provider); setProviderForm({ ...EMPTY_PROVIDER, ...provider, categories: provider.categories || [] }); setProviderError(""); setProviderModal(true); }
  function toggleProviderCategory(category) { setProviderForm(current => ({ ...current, categories: current.categories.includes(category) ? current.categories.filter(c => c !== category) : [...current.categories, category] })); }

  async function saveProvider(e) {
    e.preventDefault(); setProviderSaving(true); setProviderError("");
    try {
      const url = editingProvider ? `/api/admin/providers/${editingProvider._id}` : "/api/admin/providers";
      const res = await fetch(url, { method: editingProvider ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(providerForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save provider");
      if (editingProvider) setProviders(current => current.map(p => p._id === editingProvider._id ? data.provider : p));
      else setProviders(current => [data.provider, ...current]);
      setProviderModal(false);
    } catch (e) { setProviderError(e.message); } finally { setProviderSaving(false); }
  }

  async function deleteProvider(provider) {
    if (!window.confirm(`Delete provider "${provider.name}"? Existing service calls will keep their assigned provider name.`)) return;
    setSaving(`provider-${provider._id}`); setProviderError("");
    try {
      const res = await fetch(`/api/admin/providers/${provider._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete provider");
      setProviders(current => current.filter(p => p._id !== provider._id));
    } catch (e) { setProviderError(e.message); } finally { setSaving(""); }
  }

  function openCreateCategory() { setEditingCategory(null); setCategoryForm({ ...EMPTY_CATEGORY }); setCategoryError(""); setCategoryModal(true); }
  function openEditCategory(category) { setEditingCategory(category); setCategoryForm({ ...EMPTY_CATEGORY, ...category }); setCategoryError(""); setCategoryModal(true); }

  async function saveCategory(e) {
    e.preventDefault(); setCategorySaving(true); setCategoryError("");
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory._id}` : "/api/admin/categories";
      const res = await fetch(url, { method: editingCategory ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(categoryForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save category");
      if (editingCategory) setCategories(current => current.map(c => c._id === editingCategory._id ? data.category : c));
      else setCategories(current => [...current, data.category].sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name)));
      setCategoryModal(false);
    } catch (e) { setCategoryError(e.message); } finally { setCategorySaving(false); }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete category "${category.name}"? This will only work if no service or provider is using it.`)) return;
    setSaving(`category-${category._id}`); setCategoryError("");
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete category");
      setCategories(current => current.filter(c => c._id !== category._id));
    } catch (e) { setCategoryError(e.message); } finally { setSaving(""); }
  }

  function openCreateService(){setEditingService(null);setServiceForm({...EMPTY_SERVICE,category:categories.find(c=>c.active)?.name||"",providerName:""});setServiceImageFile(null);setServiceImagePreview("");setServiceError("");setServiceModal(true);}
  function openEditService(service){setEditingService(service);setServiceForm({...EMPTY_SERVICE,...service,slots:service.slots||EMPTY_SERVICE.slots});setServiceImageFile(null);setServiceImagePreview(service.image || "");setServiceError("");setServiceModal(true);}
  function handleServiceImageChange(e){const file=e.target.files?.[0]; if(!file)return; if(!file.type.startsWith("image/")){setServiceError("Please choose a JPG, PNG, WEBP or other image file.");e.target.value="";return;} if(file.size>5*1024*1024){setServiceError("Service image must be 5 MB or smaller.");e.target.value="";return;} setServiceImageFile(file); setServiceImagePreview(URL.createObjectURL(file)); setServiceError("");}
  function eligibleProvidersForCategory(category){return providers.filter(p=>p.status!=="Inactive"&&(!(p.categories||[]).length||p.categories.includes(category)));}
  async function saveService(e){
    e.preventDefault(); setServiceSaving(true); setServiceError("");
    try {
      const form = new FormData();
      Object.entries(serviceForm).forEach(([key, value]) => {
        if (key === "gallery" || key === "slots") form.set(key, JSON.stringify(Array.isArray(value) ? value : []));
        else form.set(key, value == null ? "" : String(value));
      });
      if (serviceImageFile) form.set("imageFile", serviceImageFile);
      const url = editingService ? `/api/admin/services/${editingService._id}` : "/api/admin/services";
      const res = await fetch(url, { method: editingService ? "PATCH" : "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save service");
      if (editingService) setServices(c => c.map(x => x._id === editingService._id ? data.service : x)); else setServices(c => [data.service, ...c]);
      setServiceModal(false); setServiceImageFile(null); setServiceImagePreview("");
    } catch(e) { setServiceError(e.message); } finally { setServiceSaving(false); }
  }
  async function deleteService(service){if(!window.confirm(`Delete service "${service.name}"?`))return;setSaving(`service-${service._id}`);setServiceError("");try{const res=await fetch(`/api/admin/services/${service._id}`,{method:"DELETE"});const data=await res.json();if(!res.ok)throw new Error(data.error||"Unable to delete service");setServices(c=>c.filter(x=>x._id!==service._id));}catch(e){setServiceError(e.message);}finally{setSaving("");}}

  const stats = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter(b => !["Closed", "Cancelled"].includes(b.status)).length,
    progress: bookings.filter(b => b.status === "In Progress").length,
    completed: bookings.filter(b => b.status === "Completed").length,
    closed: bookings.filter(b => b.status === "Closed").length,
    cancelled: bookings.filter(b => b.status === "Cancelled").length
  }), [bookings]);

  const filtered = bookings.filter((b) => {
    const text = `${b.user?.name || ""} ${b.user?.email || ""} ${b.service?.name || ""} ${b.service?.providerName || ""} ${b.assignedProvider || ""}`.toLowerCase();
    const bookingDate = String(b.date || "").slice(0, 10);
    const matchesStatus = filter === "All" || b.status === filter;
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFrom = !fromDate || bookingDate >= fromDate;
    const matchesTo = !toDate || bookingDate <= toDate;
    return matchesStatus && matchesSearch && matchesFrom && matchesTo;
  });

  function clearCallFilters() {
    setSearch("");
    setFilter("All");
    setFromDate("");
    setToDate("");
  }

  function reportRows() {
    return filtered.map((b) => ({
      "Booking ID": String(b._id || ""),
      "Service": b.service?.name || "",
      "Category": b.service?.category || "",
      "Customer": b.user?.name || "",
      "Customer Email": b.user?.email || "",
      "Customer Phone": b.user?.phone || "",
      "Appointment Date": b.date || "",
      "Appointment Time": b.time || "",
      "Provider": b.assignedProvider || b.service?.providerName || "",
      "Status": b.status || "",
      "Service Address": b.service?.address || "",
      "Service City": b.service?.city || "",
      "Address Type": formatCustomerAddressLabel(b),
      "Customer Address": formatCustomerAddress(b),
      "Payment Amount": b.paymentAmount ?? 0,
      "Paid Amount": b.paidAmount ?? 0,
      "Balance": Math.max(0, Number(b.paymentAmount || 0) - Number(b.paidAmount || 0)),
      "Transaction Method": b.transactionMethod || "",
      "Payment Status": b.paymentStatus || "Pending",
      "Transaction ID": b.transactionId || "",
      "Notes": b.notes || "",
      "Admin Notes": b.adminNotes || "",
    }));
  }

  function csvEscape(value) {
    const text = value == null ? "" : String(value);
    return /[\",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    if (!filtered.length) { window.alert("There are no service calls to export for the selected filters."); return; }
    const rows = reportRows();
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(row => headers.map(header => csvEscape(row[header])).join(","))].join("\r\n");
    downloadFile("\uFEFF" + csv, `service-calls-${fromDate || "all"}-${toDate || "all"}.csv`, "text/csv;charset=utf-8");
  }

  function exportExcel() {
    if (!filtered.length) { window.alert("There are no service calls to export for the selected filters."); return; }
    const rows = reportRows();
    const headers = Object.keys(rows[0]);
    const esc = (value) => String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>table{border-collapse:collapse;font-family:Arial,sans-serif}th,td{border:1px solid #d9d9d9;padding:7px 9px}th{background:#7045e8;color:#fff;font-weight:bold}</style></head><body><h2>Service Call Report</h2><p>Date range: ${esc(fromDate || "All")} to ${esc(toDate || "All")}</p><table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map(h => `<td>${esc(row[h])}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
    downloadFile("\uFEFF" + html, `service-calls-${fromDate || "all"}-${toDate || "all"}.xls`, "application/vnd.ms-excel;charset=utf-8");
  }
  const filteredProviders = providers.filter(p => `${p.name} ${p.phone} ${p.email} ${p.city} ${(p.categories || []).join(" ")}`.toLowerCase().includes(providerSearch.toLowerCase()));
  const filteredCategories = categories.filter(c => `${c.name} ${c.slug} ${c.description}`.toLowerCase().includes(categorySearch.toLowerCase()));
  const availableProviders = providers.filter(p => p.status !== "Inactive");
  const activeCategoryNames = categories.filter(c => c.active).map(c => c.name);
  const filteredCustomers = customers.filter(c => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(customerSearch.toLowerCase()));
  const selectedAdminCustomer = customers.find(c => c.id === adminBookingForm.customerId);
  const selectedAdminService = services.find(s => s._id === adminBookingForm.serviceId);

  return <main className="min-h-screen bg-[#faf9fc]">
    <div className="container-page py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold text-[#7045e8]">Administration</p><h1 className="mt-1 text-3xl font-black">Service Management</h1><p className="mt-2 text-sm text-[#777481]">Welcome, {admin.name}. Manage service calls, providers and categories from one place.</p></div>
        <Button variant="outline" onClick={() => { loadBookings(); loadProviders(); loadCategories(); loadCustomers(); }} disabled={loading || providersLoading || categoriesLoading || servicesLoading}>{loading || providersLoading || categoriesLoading || servicesLoading ? <Loader2 className="mr-2 animate-spin" size={16}/> : null}Refresh</Button>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto border-b">
        <TabButton active={tab === "calls"} onClick={() => setTab("calls")}><ClipboardList size={17}/>Service Calls</TabButton>
        <TabButton active={tab === "book"} onClick={() => { setTab("book"); if (!adminBookingModal) openAdminBooking(); }}><Plus size={17}/>Book Service</TabButton>
        <TabButton active={tab === "services"} onClick={() => setTab("services")}><BriefcaseBusiness size={17}/>Services <Count>{services.length}</Count></TabButton>
        <TabButton active={tab === "providers"} onClick={() => setTab("providers")}><Users size={17}/>Providers <Count>{providers.length}</Count></TabButton>
        <TabButton active={tab === "categories"} onClick={() => setTab("categories")}><Tags size={17}/>Categories <Count>{categories.length}</Count></TabButton>
      </div>

      {tab === "calls" && <>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[['Total Calls', stats.total, ClipboardList], ['Active', stats.active, Clock3], ['In Progress', stats.progress, Loader2], ['Completed', stats.completed, CheckCircle2], ['Closed', stats.closed, CheckCircle2], ['Cancelled', stats.cancelled, XCircle]].map(([label, value, Icon]) => <div key={label} className="rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#777481]">{label}</p><Icon size={17} className="text-[#7045e8]"/></div><p className="mt-2 text-2xl font-black">{value}</p></div>)}
        </div>
        <section className="mt-7 overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2 lg:w-80"><Search size={17} className="text-gray-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer or service" className="w-full bg-transparent text-sm outline-none"/></div>
              <div className="flex flex-wrap gap-2">{['All', ...STATUSES].map(s => <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === s ? 'border-[#7045e8] bg-[#7045e8] text-white' : 'hover:bg-[#f6f2ff]'}`}>{s}</button>)}</div>
            </div>
            <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div><label className="mb-1 block text-xs font-bold text-gray-600">From Date</label><input type="date" value={fromDate} max={toDate || undefined} onChange={e => setFromDate(e.target.value)} className="field h-10 min-w-[165px]"/></div>
                <div><label className="mb-1 block text-xs font-bold text-gray-600">To Date</label><input type="date" value={toDate} min={fromDate || undefined} onChange={e => setToDate(e.target.value)} className="field h-10 min-w-[165px]"/></div>
                <button type="button" onClick={clearCallFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-xs font-bold hover:bg-[#f6f2ff]"><X size={15}/>Clear Filters</button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportCSV} disabled={!filtered.length}><Download size={16} className="mr-2"/>Export CSV</Button>
                <Button onClick={exportExcel} disabled={!filtered.length}><FileSpreadsheet size={16} className="mr-2"/>Export Excel</Button>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Showing <span className="font-bold text-gray-700">{filtered.length}</span> of <span className="font-bold text-gray-700">{bookings.length}</span> service calls{fromDate || toDate ? ` between ${fromDate || "all dates"} and ${toDate || "all dates"}` : ""}.</div>
          </div>
          {error && <div className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          {loading ? <Loading text="Loading service calls..."/> : filtered.length === 0 ? <Empty text="No service calls found."/> : <div className="overflow-x-auto"><table className="w-full min-w-[1250px] text-left text-sm"><thead className="bg-[#faf8fc] text-xs uppercase text-[#777481]"><tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Appointment</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y">{filtered.map(b => <tr key={b._id} className="hover:bg-[#fcfbff]"><td className="px-4 py-4"><p className="font-bold">{b.service?.name}</p><p className="mt-1 text-xs text-gray-500">{b.service?.category} · #{String(b._id).slice(-8)}</p></td><td className="px-4 py-4"><p className="flex items-center gap-2 font-semibold"><UserRound size={15} className="text-[#7045e8]"/>{b.user?.name}</p><p className="mt-1 text-xs text-gray-500">{b.user?.email}</p>{b.user?.phone && <p className="mt-1 text-xs text-gray-500">{b.user.phone}</p>}<button type="button" onClick={()=>openAddressDetails(b)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#7045e8] hover:underline"><MapPin size={13}/>View address</button></td><td className="px-4 py-4"><p className="flex items-center gap-2"><CalendarDays size={15}/>{formatDate(b.date)}</p><p className="mt-1 flex items-center gap-2"><Clock3 size={15}/>{formatTime(b.time)}</p></td><td className="px-4 py-4"><p className="text-xs text-gray-500">Service default</p><p className="font-semibold">{b.service?.providerName || '—'}</p><select value={b.assignedProvider || ""} onChange={e => updateBooking(b._id, { assignedProvider: e.target.value, status: e.target.value && b.status === "Booked" ? "Assigned" : b.status })} disabled={saving === b._id} className="mt-2 w-52 rounded-md border px-2 py-1.5 text-xs outline-none focus:border-[#7045e8]"><option value="">Assign provider</option>{availableProviders.map(p => <option key={p._id} value={p.name}>{p.name} — {p.status}</option>)}</select></td><td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(b.status)}`}>{b.status}</span><div className="mt-2 text-xs"><span className={`rounded-full border px-2 py-1 font-semibold ${b.paymentStatus === 'Paid' ? 'border-green-200 bg-green-50 text-green-700' : b.paymentStatus === 'Partially Paid' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>{b.paymentStatus || 'Pending'}</span>{Number(b.paymentAmount || 0) > 0 && <span className="ml-2 text-gray-500">₹{Number(b.paidAmount || 0).toFixed(2)} / ₹{Number(b.paymentAmount || 0).toFixed(2)}</span>}</div></td><td className="relative px-4 py-4 text-right"><button type="button" aria-label="More actions" onClick={()=>setCallMenuId(current=>current===b._id?"":b._id)} className="rounded-lg p-2 hover:bg-[#f3edff]" title="More actions"><MoreVertical size={19}/></button>{callMenuId===b._id && <div className="absolute right-3 top-12 z-30 w-52 rounded-xl border bg-white p-1 text-left shadow-xl"><button type="button" onClick={()=>openAddressDetails(b)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f7f4ff]"><MapPin size={16}/>View Customer Address</button><button type="button" onClick={()=>openPaymentDetails(b)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f7f4ff]"><CreditCard size={16}/>Payment Details</button><div className="my-1 border-t"/><label className="block px-3 pb-1 pt-2 text-[10px] font-bold uppercase text-gray-400">Update Status</label><select value={b.status} onChange={e=>{setCallMenuId("");updateBooking(b._id,{status:e.target.value})}} disabled={saving===b._id} className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-md border px-2 py-2 text-xs font-semibold"><option value="">Select status</option>{STATUSES.map(st=><option key={st}>{st}</option>)}</select></div>}</td></tr>)}</tbody></table></div>}</section>
      </>}

      {tab === "services" && <section className="mt-7 overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-black">Service Listings</h2><p className="mt-1 text-sm text-gray-500">A category and provider do not create a bookable service. Create the service listing here.</p></div><Button onClick={openCreateService}><Plus size={17} className="mr-2"/>Add Service</Button></div></div>
        {serviceError && <div className="mx-4 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{serviceError}</div>}
        {servicesLoading ? <Loading text="Loading services..."/> : services.length===0 ? <Empty text="No services found. Click Add Service to create a bookable service."/> : <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#faf8fc] text-xs uppercase text-[#777481]"><tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Image</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y">{services.map(s=><tr key={s._id} className="hover:bg-[#fcfbff]"><td className="px-4 py-4"><p className="font-bold">{s.name}</p><p className="mt-1 text-xs text-gray-500">/{s.slug}</p></td><td className="px-4 py-4"><img src={s.image || "/images/house-cleaning.jpg"} alt={s.name} className="h-14 w-20 rounded-lg object-cover border" /></td><td className="px-4 py-4"><span className="rounded-full bg-[#f3edff] px-2 py-1 text-xs font-bold text-[#6840d8]">{s.category}</span></td><td className="px-4 py-4 font-semibold">{s.providerName}</td><td className="px-4 py-4"><p>{s.city}</p><p className="mt-1 text-xs text-gray-500">{s.address}</p></td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={()=>openEditService(s)} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold hover:bg-[#f6f2ff]"><Pencil size={14}/>Edit</button><button onClick={()=>deleteService(s)} disabled={saving===`service-${s._id}`} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14}/>{saving===`service-${s._id}`?"Deleting...":"Delete"}</button></div></td></tr>)}</tbody></table></div>}
      </section>}

      {tab === "providers" && <section className="mt-7 overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-black">Service Providers</h2><p className="mt-1 text-sm text-gray-500">Add, edit, deactivate or delete technicians and service professionals.</p></div><Button onClick={openCreateProvider}><Plus size={17} className="mr-2"/>Add Provider</Button></div><div className="mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 md:w-96"><Search size={17} className="text-gray-400"/><input value={providerSearch} onChange={e => setProviderSearch(e.target.value)} placeholder="Search provider, phone, city..." className="w-full bg-transparent text-sm outline-none"/></div></div>
        {providerError && !providerModal && <div className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{providerError}</div>}
        {providersLoading ? <Loading text="Loading providers..."/> : filteredProviders.length === 0 ? <Empty text="No providers found. Click Add Provider to create one."/> : <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#faf8fc] text-xs uppercase text-[#777481]"><tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Categories</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y">{filteredProviders.map(p => <tr key={p._id} className="hover:bg-[#fcfbff]"><td className="px-4 py-4"><p className="font-bold">{p.name}</p>{p.notes && <p className="mt-1 max-w-[230px] truncate text-xs text-gray-500">{p.notes}</p>}</td><td className="px-4 py-4"><p>{p.phone || '—'}</p><p className="mt-1 text-xs text-gray-500">{p.email || '—'}</p></td><td className="px-4 py-4"><div className="flex max-w-[220px] flex-wrap gap-1">{(p.categories || []).length ? p.categories.map(c => <span key={c} className="rounded-full bg-[#f3edff] px-2 py-1 text-[11px] font-semibold text-[#6840d8]">{c}</span>) : <span className="text-xs text-gray-400">All services</span>}</div></td><td className="px-4 py-4"><p>{p.city || '—'}</p><p className="mt-1 max-w-[180px] truncate text-xs text-gray-500">{p.address || ''}</p></td><td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${providerStatusClass(p.status)}`}>{p.status}</span></td><td className="px-4 py-4">{p.experience ? `${p.experience} years` : '—'}</td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => openEditProvider(p)} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold hover:bg-[#f6f2ff]"><Pencil size={14}/>Edit</button><button onClick={() => deleteProvider(p)} disabled={saving === `provider-${p._id}`} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14}/>{saving === `provider-${p._id}` ? 'Deleting...' : 'Delete'}</button></div></td></tr>)}</tbody></table></div>}
      </section>}

      {tab === "categories" && <section className="mt-7 overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-black">Service Categories</h2><p className="mt-1 text-sm text-gray-500">Create and manage the categories shown across the home-service application.</p></div><Button onClick={openCreateCategory}><Plus size={17} className="mr-2"/>Add Category</Button></div><div className="mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 md:w-96"><Search size={17} className="text-gray-400"/><input value={categorySearch} onChange={e => setCategorySearch(e.target.value)} placeholder="Search category..." className="w-full bg-transparent text-sm outline-none"/></div></div>
        {categoryError && !categoryModal && <div className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{categoryError}</div>}
        {categoriesLoading ? <Loading text="Loading categories..."/> : filteredCategories.length === 0 ? <Empty text="No categories found. Click Add Category to create one."/> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#faf8fc] text-xs uppercase text-[#777481]"><tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y">{filteredCategories.map(c => <tr key={c._id} className="hover:bg-[#fcfbff]"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${c.color || '#7045e8'}18`, color: c.color || '#7045e8' }}><CategoryIcon name={c.icon} size={21}/></span><div><p className="font-bold">{c.name}</p><p className="text-xs text-gray-500">{c.icon}</p></div></div></td><td className="px-4 py-4 font-mono text-xs text-gray-600">{c.slug}</td><td className="max-w-[320px] px-4 py-4 text-sm text-gray-600">{c.description || '—'}</td><td className="px-4 py-4">{c.order}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${categoryStatusClass(c.active)}`}>{c.active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => openEditCategory(c)} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold hover:bg-[#f6f2ff]"><Pencil size={14}/>Edit</button><button onClick={() => deleteCategory(c)} disabled={saving === `category-${c._id}`} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14}/>{saving === `category-${c._id}` ? 'Deleting...' : 'Delete'}</button></div></td></tr>)}</tbody></table></div>}
      </section>}
    </div>

    {adminBookingModal && <Modal title="Book Service for Customer" subtitle="Create a service call on behalf of a customer." saving={adminBookingSaving} onClose={() => setAdminBookingModal(false)}><form onSubmit={saveAdminBooking}><div className="grid gap-4 p-6 md:grid-cols-2">
      <Field label="Customer *" full><div className="flex flex-col gap-2 sm:flex-row"><input value={customerSearch} onChange={e=>{setCustomerSearch(e.target.value);setNewCustomerMode(false)}} className="field sm:flex-1" placeholder="Search customer by name, email or phone"/><Button type="button" variant="outline" onClick={()=>{setNewCustomerMode(v=>!v);setAdminBookingError("")}}><UserPlus size={16} className="mr-1"/>{newCustomerMode?"Choose Existing":"New Customer"}</Button></div>{!newCustomerMode && <><select required value={adminBookingForm.customerId} onChange={e=>selectAdminCustomer(e.target.value)} className="field mt-2"><option value="">Select customer</option>{filteredCustomers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.email}{c.phone ? ` — ${c.phone}` : ""}</option>)}</select>{customersLoading && <p className="mt-1 text-xs text-gray-500">Loading customers...</p>}</>}</Field>
      {newCustomerMode && <div className="rounded-xl border border-[#ded7ea] bg-[#fbf9ff] p-4 md:col-span-2"><div className="mb-3 flex items-center gap-2"><UserPlus size={18} className="text-[#7045e8]"/><div><p className="font-black">Add New Customer</p><p className="text-xs text-gray-500">The customer and this service address will be created together.</p></div></div><div className="grid gap-4 md:grid-cols-2"><Field label="Full Name *"><input required value={newCustomerForm.name} onChange={e=>setNewCustomerForm(f=>({...f,name:e.target.value}))} className="field"/></Field><Field label="Email *"><input required type="email" value={newCustomerForm.email} onChange={e=>setNewCustomerForm(f=>({...f,email:e.target.value}))} className="field"/></Field><Field label="Phone"><input value={newCustomerForm.phone} onChange={e=>setNewCustomerForm(f=>({...f,phone:e.target.value}))} className="field"/></Field><Field label="Address Type"><select value={newCustomerForm.label} onChange={e=>setNewCustomerForm(f=>({...f,label:e.target.value}))} className="field"><option>Home</option><option>Office</option><option>Others</option></select></Field>{newCustomerForm.label === "Others" && <Field label="Custom Name *"><input required value={newCustomerForm.customLabel} onChange={e=>setNewCustomerForm(f=>({...f,customLabel:e.target.value}))} className="field" placeholder="Shop / Site / Parent House"/></Field>}<Field label="Address Line 1 *" full><input required value={newCustomerForm.addressLine1} onChange={e=>setNewCustomerForm(f=>({...f,addressLine1:e.target.value}))} className="field"/></Field><Field label="Address Line 2"><input value={newCustomerForm.addressLine2} onChange={e=>setNewCustomerForm(f=>({...f,addressLine2:e.target.value}))} className="field"/></Field><Field label="City *"><input required value={newCustomerForm.city} onChange={e=>setNewCustomerForm(f=>({...f,city:e.target.value}))} className="field"/></Field><Field label="State *"><input required value={newCustomerForm.state} onChange={e=>setNewCustomerForm(f=>({...f,state:e.target.value}))} className="field"/></Field><Field label="PIN Code *"><input required value={newCustomerForm.pincode} onChange={e=>setNewCustomerForm(f=>({...f,pincode:e.target.value}))} className="field"/></Field><Field label="Country"><input value={newCustomerForm.country} onChange={e=>setNewCustomerForm(f=>({...f,country:e.target.value}))} className="field"/></Field><Field label="GST Number (Optional)" full><input value={newCustomerForm.gstNumber} onChange={e=>setNewCustomerForm(f=>({...f,gstNumber:e.target.value.toUpperCase()}))} className="field" placeholder="GST Number (Optional)"/></Field><div className="md:col-span-2 flex justify-end"><Button type="button" onClick={saveNewCustomer} disabled={newCustomerSaving}>{newCustomerSaving?"Creating customer...":"Create Customer & Address"}</Button></div></div></div>}
      <Field label="Service *"><select required value={adminBookingForm.serviceId} onChange={e=>selectAdminService(e.target.value)} className="field"><option value="">Select service</option>{services.map(s=><option key={s._id} value={s._id}>{s.name} — {s.category}</option>)}</select></Field>
      <Field label="Service Address *"><select required value={adminBookingForm.addressId} onChange={e=>setAdminBookingForm(f=>({...f,addressId:e.target.value}))} className="field"><option value="">Select address</option>{(selectedAdminCustomer?.serviceAddresses || []).map(a=><option key={a.id || `${a.label}-${a.addressLine1}`} value={a.id || ""}>{a.label === "Others" && a.customLabel ? a.customLabel : a.label} — {a.city}</option>)}</select>{selectedAdminCustomer?.serviceAddresses?.length ? <p className="mt-1 text-xs text-gray-500">{selectedAdminCustomer.serviceAddresses.find(a=>a.id===adminBookingForm.addressId)?.addressLine1 || "Select a saved address."}</p> : <p className="mt-1 text-xs text-red-600">Customer has no saved service address.</p>}</Field>
      <Field label="Appointment Date *"><input type="date" required min={todayKey()} value={adminBookingForm.date} onChange={e=>setAdminBookingForm(f=>({...f,date:e.target.value}))} className="field"/></Field>
      <Field label="Time Slot *"><select required value={adminBookingForm.time} onChange={e=>setAdminBookingForm(f=>({...f,time:e.target.value}))} className="field"><option value="">Select time</option>{(selectedAdminService?.slots || []).map(t=><option key={t} value={t}>{formatTime(t)}</option>)}</select></Field>
      <Field label="Payment Amount"><input type="number" min="0" step="0.01" value={adminBookingForm.paymentAmount} onChange={e=>setAdminBookingForm(f=>({...f,paymentAmount:e.target.value}))} className="field" placeholder="0.00"/></Field>
      <Field label="Paid Amount"><input type="number" min="0" step="0.01" value={adminBookingForm.paidAmount} onChange={e=>setAdminBookingForm(f=>({...f,paidAmount:e.target.value}))} className="field" placeholder="0.00"/></Field>
      <Field label="Transaction Method"><select value={adminBookingForm.transactionMethod} onChange={e=>setAdminBookingForm(f=>({...f,transactionMethod:e.target.value}))} className="field"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Online</option><option>Other</option></select></Field>
      <Field label="Payment Status"><select value={adminBookingForm.paymentStatus} onChange={e=>setAdminBookingForm(f=>({...f,paymentStatus:e.target.value}))} className="field"><option>Pending</option><option>Partially Paid</option><option>Paid</option><option>Failed</option><option>Refunded</option></select></Field>
      <Field label="Transaction ID"><input value={adminBookingForm.transactionId} onChange={e=>setAdminBookingForm(f=>({...f,transactionId:e.target.value}))} className="field" placeholder="Optional reference"/></Field>
      <Field label="Notes" full><textarea rows="3" value={adminBookingForm.notes} onChange={e=>setAdminBookingForm(f=>({...f,notes:e.target.value}))} className="field resize-none" placeholder="Notes for the service provider..."/></Field>
      <Field label="Payment Notes" full><textarea rows="2" value={adminBookingForm.paymentNotes} onChange={e=>setAdminBookingForm(f=>({...f,paymentNotes:e.target.value}))} className="field resize-none" placeholder="Optional payment notes..."/></Field>
      <div className="rounded-lg bg-[#f4efff] p-3 text-sm font-semibold md:col-span-2">Balance: ₹{Math.max(0, Number(adminBookingForm.paymentAmount || 0) - Number(adminBookingForm.paidAmount || 0)).toFixed(2)}</div>
      {adminBookingError && <div className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{adminBookingError}</div>}
    </div><ModalFooter saving={adminBookingSaving} onCancel={()=>setAdminBookingModal(false)} submitText="Create Booking"/></form></Modal>}

    {addressModal && <Modal title="Customer Address" subtitle={`Service call #${String(addressModal._id).slice(-8)}`} saving={false} onClose={()=>setAddressModal(null)}><div className="p-6"><div className="rounded-xl border bg-[#faf8fc] p-5"><div className="flex items-start gap-3"><MapPin className="mt-0.5 text-[#7045e8]" size={20}/><div className="space-y-1 text-sm"><p className="font-bold">{addressModal.user?.name || "Customer"}</p><p className="text-xs font-bold uppercase text-[#7045e8]">{formatCustomerAddressLabel(addressModal)}</p><p>{formatCustomerAddress(addressModal) || "No customer address has been saved yet."}</p><p className="pt-2 text-xs text-gray-500">Phone: {addressModal.user?.phone || "—"}</p><p className="text-xs text-gray-500">Email: {addressModal.user?.email || "—"}</p></div></div></div><div className="mt-5 flex justify-end"><Button type="button" onClick={()=>setAddressModal(null)}>Close</Button></div></div></Modal>}

    {paymentModal && <Modal title="Payment Details" subtitle={`Service call #${String(paymentModal._id).slice(-8)}`} saving={paymentSaving} onClose={()=>setPaymentModal(null)}><form onSubmit={savePayment}><div className="grid gap-4 p-6 md:grid-cols-2"><div className="rounded-xl border bg-[#faf8fc] p-4 md:col-span-2"><div className="flex items-center gap-2"><IndianRupee size={18} className="text-[#7045e8]"/><p className="font-bold">{paymentModal.service?.name || "Service"}</p></div><p className="mt-1 text-xs text-gray-500">Customer: {paymentModal.user?.name || "—"} · {formatDate(paymentModal.date)} · {formatTime(paymentModal.time)}</p></div><Field label="Payment Amount *"><input type="number" min="0" step="0.01" required value={paymentForm.paymentAmount} onChange={e=>setPaymentForm(f=>({...f,paymentAmount:e.target.value}))} className="field" placeholder="0.00"/></Field><Field label="Paid Amount"><input type="number" min="0" step="0.01" value={paymentForm.paidAmount} onChange={e=>setPaymentForm(f=>({...f,paidAmount:e.target.value}))} className="field" placeholder="0.00"/></Field><Field label="Transaction Method"><select value={paymentForm.transactionMethod} onChange={e=>setPaymentForm(f=>({...f,transactionMethod:e.target.value}))} className="field"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Online</option><option>Other</option></select></Field><Field label="Payment Status"><select value={paymentForm.paymentStatus} onChange={e=>setPaymentForm(f=>({...f,paymentStatus:e.target.value}))} className="field"><option>Pending</option><option>Partially Paid</option><option>Paid</option><option>Failed</option><option>Refunded</option></select></Field><Field label="Transaction ID"><input value={paymentForm.transactionId} onChange={e=>setPaymentForm(f=>({...f,transactionId:e.target.value}))} className="field" placeholder="UPI / bank / gateway reference"/></Field><Field label="Payment Notes" full><textarea rows="3" value={paymentForm.paymentNotes} onChange={e=>setPaymentForm(f=>({...f,paymentNotes:e.target.value}))} className="field resize-none" placeholder="Optional payment notes..."/></Field><div className="rounded-lg bg-[#f4efff] p-3 text-sm font-semibold md:col-span-2">Balance: ₹{Math.max(0, Number(paymentForm.paymentAmount || 0) - Number(paymentForm.paidAmount || 0)).toFixed(2)}</div></div><ModalFooter saving={paymentSaving} onCancel={()=>setPaymentModal(null)} submitText="Update Payment"/></form></Modal>}

    {serviceModal && <Modal title={editingService ? "Edit Service" : "Add Service"} subtitle="Create the actual bookable service shown on the public Services page." saving={serviceSaving} onClose={()=>setServiceModal(false)}><form onSubmit={saveService}><div className="grid gap-4 p-6 md:grid-cols-2">
      <Field label="Service Name *"><input required value={serviceForm.name} onChange={e=>setServiceForm({...serviceForm,name:e.target.value,slug:serviceForm.slug||slugifyClient(e.target.value)})} className="field" placeholder="House Cleaning"/></Field>
      <Field label="Slug"><input value={serviceForm.slug} onChange={e=>setServiceForm({...serviceForm,slug:e.target.value})} className="field" placeholder="house-cleaning"/></Field>
      <Field label="Category *"><select required value={serviceForm.category} onChange={e=>{const category=e.target.value;const eligible=eligibleProvidersForCategory(category);setServiceForm({...serviceForm,category,providerName:eligible.some(p=>p.name===serviceForm.providerName)?serviceForm.providerName:(eligible[0]?.name||"")});}} className="field"><option value="">Select category</option>{categories.filter(c=>c.active).map(c=><option key={c._id}>{c.name}</option>)}</select></Field>
      <Field label="Provider *"><select required value={serviceForm.providerName} onChange={e=>setServiceForm({...serviceForm,providerName:e.target.value})} className="field"><option value="">Select provider</option>{eligibleProvidersForCategory(serviceForm.category).map(p=><option key={p._id}>{p.name}</option>)}</select><p className="mt-1 text-xs text-gray-500">Only active providers assigned to this category are shown.</p></Field>
      <Field label="Address *" full><input required value={serviceForm.address} onChange={e=>setServiceForm({...serviceForm,address:e.target.value})} className="field" placeholder="255 Grand Park Ave"/></Field>
      <Field label="City"><input value={serviceForm.city} onChange={e=>setServiceForm({...serviceForm,city:e.target.value})} className="field"/></Field>
      <Field label="Email"><input type="email" value={serviceForm.email} onChange={e=>setServiceForm({...serviceForm,email:e.target.value})} className="field"/></Field>
      <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-semibold">Service Image</label><div className="rounded-xl border border-dashed bg-[#faf9fc] p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="h-28 w-40 shrink-0 overflow-hidden rounded-lg border bg-white">{serviceImagePreview ? <img src={serviceImagePreview} alt="Service preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>}</div><div className="flex-1"><input id="service-image" type="file" accept="image/*" onChange={handleServiceImageChange} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#7045e8] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#6036d0]"/><p className="mt-2 text-xs text-gray-500">JPG, PNG, WEBP or other browser-supported image · maximum 5 MB.</p><p className="mt-1 text-xs font-medium text-[#7045e8]">Images are uploaded securely to Cloudinary when you save the service.</p>{editingService?.imagePublicId && !serviceImageFile && <p className="mt-1 text-xs text-green-600">Current Cloudinary image will be kept until you choose a replacement.</p>}</div></div></div></div>
      <Field label="Available From"><input type="time" value={serviceForm.availableFrom} onChange={e=>setServiceForm({...serviceForm,availableFrom:e.target.value})} className="field"/></Field>
      <Field label="Available To"><input type="time" value={serviceForm.availableTo} onChange={e=>setServiceForm({...serviceForm,availableTo:e.target.value})} className="field"/></Field>
      <Field label="Description" full><textarea rows="4" value={serviceForm.description} onChange={e=>setServiceForm({...serviceForm,description:e.target.value})} className="field resize-none" placeholder="Describe the service..."/></Field>
      {serviceError && <div className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{serviceError}</div>}
    </div><ModalFooter saving={serviceSaving} onCancel={()=>setServiceModal(false)} submitText={editingService?"Update Service":"Create Service"}/></form></Modal>}

    {providerModal && <Modal title={editingProvider ? "Edit Provider" : "Add Provider"} subtitle="Provider details used for service-call assignment." saving={providerSaving} onClose={() => setProviderModal(false)}><form onSubmit={saveProvider}><div className="grid gap-4 p-6 md:grid-cols-2">
      <Field label="Name *"><input required value={providerForm.name} onChange={e => setProviderForm({...providerForm, name: e.target.value})} className="field" placeholder="Jenny Wilson"/></Field>
      <Field label="Phone"><input value={providerForm.phone} onChange={e => setProviderForm({...providerForm, phone: e.target.value})} className="field" placeholder="+1 212 555 0101"/></Field>
      <Field label="Email"><input type="email" value={providerForm.email} onChange={e => setProviderForm({...providerForm, email: e.target.value})} className="field" placeholder="provider@example.com"/></Field>
      <Field label="City"><input value={providerForm.city} onChange={e => setProviderForm({...providerForm, city: e.target.value})} className="field" placeholder="New York"/></Field>
      <Field label="Address" full><input value={providerForm.address} onChange={e => setProviderForm({...providerForm, address: e.target.value})} className="field" placeholder="Street address"/></Field>
      <div className="md:col-span-2"><p className="text-sm font-semibold">Service Categories</p><div className="mt-2 flex flex-wrap gap-2">{categories.filter(c => c.active).map(c => <button type="button" key={c._id} onClick={() => toggleProviderCategory(c.name)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${providerForm.categories.includes(c.name) ? "border-[#7045e8] bg-[#7045e8] text-white" : "hover:bg-[#f6f2ff]"}`}>{c.name}</button>)}</div><p className="mt-1 text-xs text-gray-500">Leave empty if this provider can handle all service categories.</p></div>
      <Field label="Status"><select value={providerForm.status} onChange={e => setProviderForm({...providerForm, status: e.target.value})} className="field"><option>Available</option><option>Busy</option><option>Inactive</option></select></Field>
      <Field label="Experience (years)"><input type="number" min="0" value={providerForm.experience} onChange={e => setProviderForm({...providerForm, experience: e.target.value})} className="field"/></Field>
      <Field label="Notes" full><textarea rows="3" value={providerForm.notes} onChange={e => setProviderForm({...providerForm, notes: e.target.value})} className="field resize-none" placeholder="Internal notes..."/></Field>
      {providerError && <div className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{providerError}</div>}
    </div><ModalFooter saving={providerSaving} onCancel={() => setProviderModal(false)} submitText={editingProvider ? "Update Provider" : "Create Provider"}/></form></Modal>}

    {categoryModal && <Modal title={editingCategory ? "Edit Category" : "Add Category"} subtitle="Category details used throughout the home-service application." saving={categorySaving} onClose={() => setCategoryModal(false)}><form onSubmit={saveCategory}><div className="grid gap-4 p-6 md:grid-cols-2">
      <Field label="Category Name *"><input required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value, slug: categoryForm.slug || slugifyClient(e.target.value)})} className="field" placeholder="Cleaning"/></Field>
      <Field label="Slug"><input value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} className="field" placeholder="cleaning"/></Field>
      <Field label="Icon"><select value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} className="field">{ICONS.map(icon => <option key={icon}>{icon}</option>)}</select></Field>
      <Field label="Color"><div className="flex gap-2"><input type="color" value={categoryForm.color || "#7045e8"} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} className="h-11 w-14 cursor-pointer rounded-md border p-1"/><input value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} className="field flex-1" placeholder="#7045e8"/></div></Field>
      <Field label="Display Order"><input type="number" min="0" value={categoryForm.order} onChange={e => setCategoryForm({...categoryForm, order: e.target.value})} className="field"/></Field>
      <Field label="Status"><select value={categoryForm.active ? "Active" : "Inactive"} onChange={e => setCategoryForm({...categoryForm, active: e.target.value === "Active"})} className="field"><option>Active</option><option>Inactive</option></select></Field>
      <Field label="Description" full><textarea rows="4" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} className="field resize-none" placeholder="Describe the services included in this category..."/></Field>
      <div className="md:col-span-2 rounded-xl border bg-[#faf8fc] p-4"><p className="text-xs font-bold uppercase text-gray-500">Preview</p><div className="mt-3 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: `${categoryForm.color || '#7045e8'}18`, color: categoryForm.color || '#7045e8' }}><CategoryIcon name={categoryForm.icon} size={23}/></span><div><p className="font-bold">{categoryForm.name || "Category Name"}</p><p className="text-xs text-gray-500">{categoryForm.description || "Category description"}</p></div></div></div>
      {categoryError && <div className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{categoryError}</div>}
    </div><ModalFooter saving={categorySaving} onCancel={() => setCategoryModal(false)} submitText={editingCategory ? "Update Category" : "Create Category"}/></form></Modal>}
  </main>;
}

function formatCustomerAddressLabel(booking) {
  const label = booking?.customerAddress?.label || "";
  const custom = booking?.customerAddress?.customLabel || "";
  return label === "Others" && custom ? custom : label || "Service Address";
}
function formatCustomerAddress(booking) {
  const a = booking?.customerAddress || {};
  const u = booking?.user || {};
  const parts = [a.addressLine1 || u.addressLine1, a.addressLine2 || u.addressLine2, a.city || u.city, a.state || u.state, a.pincode || u.pincode, a.country || u.country].map(v => String(v || "").trim()).filter(Boolean);
  const gst = a.gstNumber || "";
  return gst ? `${parts.join(", ")} | GST: ${gst}` : parts.join(", ");
}
function TabButton({ active, onClick, children }) { return <button onClick={onClick} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${active ? "border-[#7045e8] text-[#7045e8]" : "border-transparent text-gray-500"}`}>{children}</button>; }
function Count({ children }) { return <span className="rounded-full bg-[#f1ebff] px-2 py-0.5 text-xs">{children}</span>; }
function Loading({ text }) { return <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500"><Loader2 className="animate-spin" size={18}/>{text}</div>; }
function Empty({ text }) { return <div className="p-12 text-center text-gray-500">{text}</div>; }
function Field({ label, children, full }) { return <label className={`text-sm font-semibold ${full ? "md:col-span-2" : ""}`}>{label}{children}</label>; }
function Modal({ title, subtitle, saving, onClose, children }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={e => { if (e.target === e.currentTarget && !saving) onClose(); }}><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4"><div><h3 className="text-xl font-black">{title}</h3><p className="mt-1 text-xs text-gray-500">{subtitle}</p></div><button type="button" onClick={onClose} disabled={saving} className="rounded-full p-2 hover:bg-gray-100"><X size={19}/></button></div>{children}</div></div>; }
function ModalFooter({ saving, onCancel, submitText }) { return <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white px-6 py-4"><Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 animate-spin" size={16}/> : null}{submitText}</Button></div>; }
function slugifyClient(value = "") { return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
