"use client";

import { Phone } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_PHONE = "+91 98942 29636";

function phoneDigits(value) {
  return String(value || "").replace(/[^0-9+]/g, "");
}

function whatsappDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function WhatsAppIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.5 3.5A11.94 11.94 0 0 0 12.02 0C5.4 0 .02 5.38.02 12c0 2.11.55 4.17 1.6 5.98L0 24l6.2-1.62A11.95 11.95 0 0 0 12.02 24C18.64 24 24 18.62 24 12c0-3.2-1.24-6.2-3.5-8.5Z"
        fill="currentColor"
      />
      <path
        d="M17.52 14.35c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
        fill="white"
      />
    </svg>
  );
}

export default function FloatingContactActions() {
  const [phone, setPhone] = useState(DEFAULT_PHONE);

  useEffect(() => {
    fetch("/api/company", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.company?.phone) setPhone(data.company.phone);
      })
      .catch(() => {});
  }, []);

  const tel = phoneDigits(phone);
  const whatsapp = whatsappDigits(phone) || "919894229636";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[60] hidden flex-col gap-3 md:flex">
        <a
          href={`tel:${tel}`}
          aria-label={`Call ${phone}`}
          title={`Call ${phone}`}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f97316] text-white shadow-xl transition hover:scale-105 hover:bg-[#ea580c]"
        >
          <Phone size={25} fill="currentColor" />
        </a>

        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 hover:bg-[#1ebe5d]"
        >
          <WhatsAppIcon size={25} />
        </a>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-2 border-t border-gray-200 bg-white px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.12)] md:hidden">
        <a
          href={`tel:${tel}`}
          className="mx-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#f97316] text-sm font-bold text-white"
        >
          <Phone size={20} fill="currentColor" />
          Call Now
        </a>

        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="mx-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-bold text-white"
        >
          <WhatsAppIcon size={20} />
          WhatsApp
        </a>
      </div>
    </>
  );
}
