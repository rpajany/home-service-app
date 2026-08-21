import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import Company from "@/models/Company";
import Service from "@/models/Service";
import ContactBookingForm from "@/components/ContactBookingForm";

export const dynamic = "force-dynamic";

const DEFAULT_COMPANY = {
  name: "Home Services",
  address: "No.113, Sundaram Mesthiri Street, Kosapalayam, Puducherry – 605013",
  phone: "+91 98942 29636",
  email: "pkumarayan@gmail.com",
};

function plainCompany(company) {
  return {
    name: String(company?.name || DEFAULT_COMPANY.name),
    address: String(company?.address || DEFAULT_COMPANY.address),
    phone: String(company?.phone || DEFAULT_COMPANY.phone),
    email: String(company?.email || DEFAULT_COMPANY.email),
  };
}

function phoneHref(phone) {
  return `tel:${String(phone || "").replace(/[^0-9+]/g, "")}`;
}

function whatsappHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

async function getContactData() {
  try {
    await connectDB();

    const [company, services] = await Promise.all([
      Company.findOne().lean(),
      Service.find({}, { name: 1, category: 1 })
        .sort({ name: 1 })
        .lean(),
    ]);

    const serviceOptions = services
      .map((service) => String(service?.name || "").trim())
      .filter(Boolean);

    return {
      company: plainCompany(company),
      serviceOptions: [...new Set(serviceOptions)],
    };
  } catch (error) {
    console.error("CONTACT_PAGE_DATA_ERROR", error);
    return {
      company: DEFAULT_COMPANY,
      serviceOptions: [],
    };
  }
}

export default async function ContactPage() {
  const { company, serviceOptions } = await getContactData();
  const mapQuery = encodeURIComponent(company.address);

  return (
    <main>
      {/* PAGE HERO */}
      <section className="bg-[#f7f9fc] px-4 py-12 md:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full bg-[#fff1e8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ed6509]">
              Get In Touch
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#102132] md:text-6xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#68788b]">
              Need a home appliance repair or service? Contact our team and we
              will get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-[#e1e7ee] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <MapPin className="text-[#ed6509]" size={28} />
            <h2 className="mt-4 font-black text-[#102132]">Our Location</h2>
            <p className="mt-2 text-sm leading-6 text-[#6d7c8d]">{company.address}</p>
          </a>

          <a
            href={phoneHref(company.phone)}
            className="rounded-2xl border border-[#e1e7ee] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <Phone className="text-[#ed6509]" size={28} fill="currentColor" />
            <h2 className="mt-4 font-black text-[#102132]">Call Us Anytime</h2>
            <p className="mt-2 text-sm font-semibold text-[#6d7c8d]">{company.phone}</p>
          </a>

          <a
            href={`mailto:${company.email}`}
            className="rounded-2xl border border-[#e1e7ee] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <Mail className="text-[#ed6509]" size={28} />
            <h2 className="mt-4 font-black text-[#102132]">Email Us</h2>
            <p className="mt-2 break-all text-sm font-semibold text-[#6d7c8d]">{company.email}</p>
          </a>

          <div className="rounded-2xl border border-[#e1e7ee] bg-white p-6 shadow-sm">
            <Clock3 className="text-[#ed6509]" size={28} />
            <h2 className="mt-4 font-black text-[#102132]">Working Hours</h2>
            <p className="mt-2 text-sm leading-6 text-[#6d7c8d]">
              Monday – Saturday
              <br />
              7:00 AM – 9:00 PM
              <br />
              Sunday: Emergency Only
            </p>
          </div>
        </div>
      </section>

      {/* BOOK A SERVICE */}
      <section className="bg-[#f7f9fc] py-10 md:py-14">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex rounded-full bg-[#fff1e8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ed6509]">
                Get In Touch
              </span>
              <h2 className="mt-4 text-3xl font-black text-[#102132] md:text-5xl">
                Book a Service
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#68788b]">
                Fill in the form and our team will contact you to confirm the
                service, preferred date and requirements.
              </p>

              <div className="mt-7 space-y-3">
                <a
                  href={phoneHref(company.phone)}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-[#ed6509]">
                    <Phone size={20} fill="currentColor" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-[#8995a4]">Immediate help</span>
                    <span className="block text-sm font-bold text-[#102132]">{company.phone}</span>
                  </span>
                </a>

                <a
                  href={whatsappHref(company.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-[#25d366]">
                    <MessageCircle size={21} fill="currentColor" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-[#8995a4]">Prefer WhatsApp?</span>
                    <span className="block text-sm font-bold text-[#102132]">Chat with us</span>
                  </span>
                </a>
              </div>
            </div>

            <ContactBookingForm
              companyEmail={company.email}
              serviceOptions={serviceOptions}
            />
          </div>
        </div>
      </section>

      {/* FIND US */}
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-7 lg:grid-cols-[1fr_1.25fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-[#fff1e8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ed6509]">
              Find Us
            </span>
            <h2 className="mt-4 text-3xl font-black text-[#102132] md:text-4xl">
              Our Location
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#68788b]">
              We are located in Kosapalayam, Puducherry — easy to find and reach
              from anywhere in Pondicherry.
            </p>
            <p className="mt-4 font-semibold text-[#102132]">{company.address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#102132] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d3449]"
            >
              Get Directions <ArrowRight size={16} />
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e1e7ee] bg-[#eef2f6] shadow-sm">
            <iframe
              title="Ayyan Service location map"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-[320px] w-full border-0 md:h-[380px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section className="container-page pb-12 md:pb-16">
        <div className="rounded-2xl bg-[#102132] px-6 py-8 text-center text-white md:px-10">
          <h2 className="text-2xl font-black">Prefer WhatsApp?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
            Send us a message and we will respond as soon as possible.
          </p>
          <a
            href={whatsappHref(company.phone)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-6 py-3 text-sm font-bold text-white hover:bg-[#1ebe5d]"
          >
            <MessageCircle size={18} fill="currentColor" />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
