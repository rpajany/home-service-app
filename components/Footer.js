"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

const DEFAULT_COMPANY = {
  name: "Home Services",
  address: "Puducherry",
  phone: "",
  email: "",
  tagline: "Your neighborhood home appliance specialists, serving Puducherry & Tamil Nadu with pride since 2008.",
};

const SERVICE_LINKS = [
  ["Cleaning", "/services?category=Cleaning"],
  ["Electric", "/services?search=Electric"],
  ["Painting", "/services?search=Painting"],
  ["Plumbing", "/services?search=Plumbing"],
  ["Shifting", "/services?search=Shifting"],
    ["Carpenter", "/services?search=Carpenter"],
];

function phoneHref(phone) {
  return `tel:${String(phone || "").replace(/[^0-9+]/g, "")}`;
}

export default function Footer() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetch("/api/company", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setCompany(data?.company || null))
      .catch(() => {});
  }, []);

  const info = { ...DEFAULT_COMPANY, ...(company || {}) };
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#0c1d2d] text-white">
      <div className="container-page py-10 md:py-12">
        <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.25fr]">
          <div>
            <Link href="/" className="inline-block text-xl font-black tracking-tight">
              {info.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              {info.footerText || info.tagline || DEFAULT_COMPANY.tagline}
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/75">
              <a href={phoneHref(info.phone)} className="flex items-start gap-2 hover:text-white">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#f97316]" fill="currentColor" />
                {info.phone}
              </a>
              <a href={`mailto:${info.email}`} className="flex items-start gap-2 break-all hover:text-white">
                <Mail size={16} className="mt-0.5 shrink-0 text-[#f97316]" />
                {info.email}
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Services</h2>
            <div className="mt-4 space-y-2.5 text-sm text-white/65">
              {SERVICE_LINKS.map(([label, href]) => (
                <Link key={label} href={href} className="block hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Quick Links</h2>
            <div className="mt-4 space-y-2.5 text-sm text-white/65">
              <Link href="/" className="block hover:text-white">Home</Link>
              <Link href="/about" className="block hover:text-white">About Us</Link>
              <Link href="/services" className="block hover:text-white">Services</Link>
              <Link href="/contact" className="block hover:text-white">Contact</Link>
              <Link href="/services" className="block hover:text-white">Book a Service</Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Contact Us</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 hover:text-white"
              >
                <MapPin size={17} className="mt-1 shrink-0 text-[#f97316]" />
                <span>{info.address}</span>
              </a>
              <div className="flex items-start gap-2">
                <Clock3 size={17} className="mt-1 shrink-0 text-[#f97316]" />
                <span>Mon–Sat: 7:00 AM – 9:00 PM<br />Sunday: Emergency Only</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-9 border-t border-white/10 pt-5 text-center text-xs text-white/50 md:flex md:items-center md:justify-between md:text-left">
          <p>© {year} {info.name}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed in Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
