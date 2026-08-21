"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
  CalendarDays,
  X,
  Building2,
  Phone,
  MapPin,
  Clock3,
  Mail,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const DEFAULT_COMPANY = {
  name: "Home Services",
  address: "No.113, Sundaram Mesthiri Street, Kosapalayam, Puducherry – 605013",
  phone: "+91 98942 29636",
  email: "pkumarayan@gmail.com",
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const profileMenuRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => {
    const loadCompany = () => {
      fetch("/api/company", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setCompany(data?.company || null))
        .catch(() => {});
    };

    loadUser();
    loadCompany();

    window.addEventListener("company-updated", loadCompany);
    return () => window.removeEventListener("company-updated", loadCompany);
  }, [pathname]);

  useEffect(() => {
    function handleOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
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

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setProfileOpen(false);
      setMobileOpen(false);
      setLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  }

  const info = {
    ...DEFAULT_COMPANY,
    ...(company || {}),
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "U";

  const phoneHref = `tel:${String(info.phone).replace(/[^0-9+]/g, "")}`;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* TOP INFORMATION BAR */}
      <div className="hidden bg-[#0c1d2d] text-white md:block">
        <div className="container-page flex min-h-11 items-center justify-center gap-7 text-xs font-medium lg:gap-9">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <MapPin size={15} className="text-orange-500" />
            {info.address}
          </span>

          <span className="flex items-center gap-2 whitespace-nowrap">
            <Clock3 size={15} className="text-orange-500" />
            Mon – Sat: 7:00 AM – 9:00 PM
          </span>

          <a
            href={`mailto:${info.email}`}
            className="flex items-center gap-2 whitespace-nowrap hover:text-orange-300"
          >
            <Mail size={15} className="text-orange-500" />
            {info.email}
          </a>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="border-b border-[#e9e5ee] bg-[#7045e8] text-white">
        <div className="container-page flex h-[72px] items-center justify-between">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-2 font-black tracking-tight text-white"
          >
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name || "Company"}
                className="h-9 max-w-32 object-contain"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-black text-white">
                HS
              </span>
            )}
            <span className="truncate text-[20px]">{info.name}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <Link href="/" className="hover:text-white/80">Home</Link>
            <Link href="/services" className="hover:text-white/80">Services</Link>
            <Link href="/about" className="hover:text-white/80">About Us</Link>
            <Link href="/contact" className="hover:text-white/80">Contact</Link>
            {user && <Link href="/bookings" className="hover:text-white/80">My Bookings</Link>}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {/* DESKTOP CALL BUTTON */}
            <a
              href={phoneHref}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#f97316] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#ea580c]"
              aria-label={`Call ${info.phone}`}
            >
              <Phone size={18} fill="currentColor" />
              <span>{info.phone}</span>
            </a>

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full p-1.5 pr-2 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#064b3d] text-sm font-bold text-white">
                    {initials}
                  </span>
                  <span className="max-w-[130px] truncate text-sm font-semibold text-white">{user.name}</span>
                  <ChevronDown size={16} className={`text-white transition ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div role="menu" className="absolute right-0 top-[52px] w-64 overflow-hidden rounded-xl border border-[#e7e2ee] bg-white text-[#292332] shadow-xl">
                    <div className="border-b border-[#eeeaf3] px-4 py-3">
                      <p className="truncate text-sm font-bold text-[#171323]">{user.name}</p>
                      <p className="truncate text-xs text-[#7b7886]">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link role="menuitem" href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                        <UserRound size={17} className="text-[#7045e8]" /> Profile
                      </Link>
                      <Link role="menuitem" href="/bookings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                        <CalendarDays size={17} className="text-[#7045e8]" /> My Bookings
                      </Link>
                      {user.role === "admin" && (
                        <Link role="menuitem" href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                          <CalendarDays size={17} className="text-[#7045e8]" /> Admin Dashboard
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link role="menuitem" href="/admin/company" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[#f5f1fb]">
                          <Building2 size={17} className="text-[#7045e8]" /> Company
                        </Link>
                      )}
                      <button role="menuitem" type="button" onClick={logout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
                        <LogOut size={17} /> {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Login / Sign Up</Button>
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 md:hidden"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-[#e7e2ee] bg-white px-4 py-4 text-[#292332] shadow-lg md:hidden">
          <div className="container-page flex flex-col gap-1 text-sm font-semibold">
            <a href={phoneHref} className="mb-2 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-3 font-bold text-orange-600">
              <Phone size={18} fill="currentColor" /> Call {info.phone}
            </a>
            <Link href="/" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-3 hover:bg-[#f5f1fb]">Home</Link>
            <Link href="/services" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-3 hover:bg-[#f5f1fb]">Services</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-3 hover:bg-[#f5f1fb]">About Us</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-3 hover:bg-[#f5f1fb]">Contact</Link>

            {user && (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-[#f5f1fb]"><UserRound size={18} className="text-[#7045e8]" /> Profile</Link>
                <Link href="/bookings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-[#f5f1fb]"><CalendarDays size={18} className="text-[#7045e8]" /> My Bookings</Link>
                {user.role === "admin" && <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-[#f5f1fb]"><CalendarDays size={18} className="text-[#7045e8]" /> Admin Dashboard</Link>}
                {user.role === "admin" && <Link href="/admin/company" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-[#f5f1fb]"><Building2 size={18} className="text-[#7045e8]" /> Company</Link>}
                <button type="button" className="flex items-center gap-3 rounded-md px-3 py-3 text-left text-red-600 hover:bg-red-50" onClick={logout} disabled={loggingOut}>
                  <LogOut size={18} /> {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            )}

            {!user && (
              <div className="mt-2 px-3">
                <Link href="/login" onClick={() => setMobileOpen(false)}><Button className="w-full">Login / Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
