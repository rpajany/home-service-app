"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";

export default function ContactBookingForm({ companyEmail = "", serviceOptions = [] }) {
  const options = useMemo(() => {
    const base = serviceOptions.length
      ? serviceOptions
      : [
          "AC Service",
          "Fridge Repair",
          "Washing Machine",
          "TV Repair",
          "Microwave Oven",
          "Other Home Service",
        ];

    return [...new Set(base)];
  }, [serviceOptions]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    problem: "",
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to send your request.");
      }

      if (data?.fallback && data?.mailto) {
        window.location.href = data.mailto;
        setMessage(data.message || "Your email app is ready.");
      } else {
        setMessage(data?.message || "Booking request sent successfully.");
      }

      setForm({
        name: "",
        phone: "",
        email: "",
        service: "",
        date: "",
        problem: "",
      });
    } catch (submitError) {
      setError(submitError.message || "Unable to send your request.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#ed6509]">
          <Mail size={21} />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#102132]">Send a Service Request</h3>
          <p className="mt-1 text-sm text-[#758396]">
            Fill in the form and our team will call you back within 2 hours.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#27384a]">
            Your Name <span className="text-orange-600">*</span>
            <input
              name="name"
              value={form.name}
              onChange={change}
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Enter your name"
              className="field"
            />
          </label>

          <label className="text-sm font-semibold text-[#27384a]">
            Phone Number <span className="text-orange-600">*</span>
            <input
              name="phone"
              value={form.phone}
              onChange={change}
              required
              maxLength={40}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91 XXXXX XXXXX"
              className="field"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#27384a]">
            Email Address
            <input
              name="email"
              value={form.email}
              onChange={change}
              type="email"
              maxLength={150}
              autoComplete="email"
              placeholder="your@email.com"
              className="field"
            />
          </label>

          <label className="text-sm font-semibold text-[#27384a]">
            Select Service <span className="text-orange-600">*</span>
            <select
              name="service"
              value={form.service}
              onChange={change}
              required
              className="field bg-white"
            >
              <option value="">Select a service</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-semibold text-[#27384a]">
          Preferred Date
          <input
            name="date"
            value={form.date}
            onChange={change}
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            className="field"
          />
        </label>

        <label className="block text-sm font-semibold text-[#27384a]">
          Describe the Problem
          <textarea
            name="problem"
            value={form.problem}
            onChange={change}
            maxLength={1000}
            rows={5}
            placeholder="Tell us what service or repair you need..."
            className="field resize-y"
          />
          <span className="mt-1 block text-right text-xs text-[#8b96a5]">
            {form.problem.length} / 1000
          </span>
        </label>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        {message && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ed6509] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d95700] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Send size={17} />
          {sending ? "Sending..." : "Send Request"}
        </button>

        <p className="text-xs leading-5 text-[#8995a4]">
          Your request will be sent to {companyEmail || "our company email"}.
          If email delivery is not configured on the server, your device email
          app will open with the request already filled in.
        </p>
      </form>
    </div>
  );
}
