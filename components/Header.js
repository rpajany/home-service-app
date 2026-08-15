"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, UserRound, CalendarDays, X, Building2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [company, setCompany] = useState(null);

  async function loadUser() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = res.ok ? await res.json() : null;
      setUser(data?.user || null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => { const loadCompany = () => fetch("/api/company", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => setCompany(d?.company || null)).catch(() => {}); loadUser(); loadCompany(); window.addEventListener("company-updated", loadCompany); return () => window.removeEventListener("company-updated", loadCompany); }, [pathname]);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } finally {
      setUser(null);
      setOpen(false);
      setLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  }

  const initials = user?.name
    ? user.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : "U";

  return <header className="sticky top-0 z-40 border-b border-[#5b32cf] bg-[#7045e8] text-white shadow-sm">
    <div className="container-page flex h-[72px] items-center justify-between">
      <Link href="/" className="flex min-w-0 items-center gap-2 font-black tracking-tight text-white">{company?.logo ? <img src={company.logo} alt={company.name || "Company"} className="h-9 max-w-32 object-contain" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-black text-white">HS</span>}<span className="truncate text-[20px]">{company?.name || "Home Services"}</span></Link>
      <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
        <Link href="/" className="hover:text-white/80">Home</Link>
        <Link href="/services" className="hover:text-white/80">Services</Link>
        <Link href="/about" className="hover:text-white/80">About Us</Link>
        {user && <Link href="/bookings" className="hover:text-white/80">My Bookings</Link>}
      </nav>

      <div className="hidden items-center md:flex">
        {user ? <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full p-1.5 pr-2 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#064b3d] text-sm font-bold text-white">{initials}</span>
            <span className="max-w-[130px] truncate text-sm font-semibold text-white">{user.name}</span>
            <ChevronDown size={16} className={`text-[#6e6977] transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && <div role="menu" className="absolute right-0 top-[52px] w-64 overflow-hidden rounded-xl border border-[#e7e2ee] bg-white text-[#292332] shadow-xl">
            <div className="border-b border-[#eeeaf3] px-4 py-3">
              <p className="truncate text-sm font-bold text-[#171323]">{user.name}</p>
              <p className="truncate text-xs text-[#7b7886]">{user.email}</p>
            </div>
            <div className="p-1.5">
              <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                <UserRound size={17} className="text-[#7045e8]" /> Profile
              </Link>
              <Link role="menuitem" href="/bookings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                <CalendarDays size={17} className="text-[#7045e8]" /> My Bookings
              </Link>
              {user.role === "admin" && <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                <CalendarDays size={17} className="text-[#7045e8]" /> Admin Dashboard
              </Link>}{user.role === "admin" && <Link role="menuitem" href="/admin/company" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                <Building2 size={17} className="text-[#7045e8]" /> Company
              </Link>}
              <button role="menuitem" type="button" onClick={logout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                <LogOut size={17} /> {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>}
        </div> : <Link href="/login"><Button size="sm">Login / Sign Up</Button></Link>}
      </div>

      <button aria-label="Toggle menu" className="text-white md:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>

    {open && <div className="border-t bg-white px-4 py-4 text-[#292332] md:hidden">
      <div className="container-page flex flex-col gap-3 text-sm font-semibold">
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/services" onClick={() => setOpen(false)}>Services</Link>
        <Link href="/about" onClick={() => setOpen(false)}>About Us</Link>
        {user && <>
          <Link href="/profile" onClick={() => setOpen(false)}>Profile</Link>
          <Link href="/bookings" onClick={() => setOpen(false)}>My Bookings</Link>
          {user.role === "admin" && <><Link href="/admin" onClick={() => setOpen(false)}>Admin Dashboard</Link><Link href="/admin/company" onClick={() => setOpen(false)}>Company</Link></>}
          <button type="button" className="flex items-center gap-2 text-left text-red-600" onClick={logout} disabled={loggingOut}>
            <LogOut size={17}/> {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </>}
        {!user && <Link href="/login" onClick={() => setOpen(false)}><Button className="w-full">Login / Sign Up</Button></Link>}
      </div>
    </div>}
  </header>;
}
