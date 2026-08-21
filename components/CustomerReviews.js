"use client";

import { useMemo, useState } from "react";
import { Send, Star } from "lucide-react";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function Stars({ rating, interactive = false, value, onChange }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating || value || 0} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = interactive
          ? star <= (value || 0)
          : star <= (rating || 0);

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              className="rounded-sm p-0.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <Star
                size={24}
                fill={active ? "currentColor" : "none"}
                className={active ? "text-[#f59e0b]" : "text-[#cbd5e1]"}
              />
            </button>
          );
        }

        return (
          <Star
            key={star}
            size={14}
            fill={active ? "currentColor" : "none"}
            className={active ? "text-[#f59e0b]" : "text-[#cbd5e1]"}
          />
        );
      })}
    </div>
  );
}

export default function CustomerReviews({ initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [form, setForm] = useState({
    name: "",
    area: "",
    rating: 0,
    review: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const countText = useMemo(() => {
    if (!reviews.length) return "Be the first customer to share your experience.";
    return `${reviews.length} customer review${reviews.length === 1 ? "" : "s"}`;
  }, [reviews.length]);

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitReview(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save your review.");
      }

      if (data?.review) {
        setReviews((current) => [data.review, ...current].slice(0, 12));
      }

      setForm({ name: "", area: "", rating: 0, review: "" });
      setMessage("Thank you! Your review has been submitted.");
    } catch (submitError) {
      setError(submitError.message || "Unable to save your review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="container-page py-10 md:py-14">
      <div className="mb-6 text-center">
        <span className="inline-flex rounded-full bg-[#fff1e8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ed6509]">
          Customer Reviews
        </span>
        <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-tight md:text-5xl">
          What Puducherry Customers Say About Us
        </h2>
        <p className="mt-3 text-sm text-[#777481]">{countText}</p>
      </div>

      {reviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((item) => (
            <article
              key={item._id}
              className="min-w-0 rounded-2xl border border-[#e2e7ed] bg-[#f8fafc] p-6"
            >
              <Stars rating={item.rating} />

              <p className="mt-4 min-h-24 text-sm italic leading-6 text-[#65748a]">
                “{item.review}”
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#102132] text-sm font-bold text-white">
                  {String(item.name || "C").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#102132]">{item.name}</p>
                  <p className="truncate text-xs text-[#7b8797]">{item.area}</p>
                  <p className="text-[10px] text-[#9aa5b4]">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
          No customer reviews yet. Share your experience below.
        </div>
      )}

      <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-[#e2e7ed] bg-[#f8fafc] p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <Star className="mt-1 shrink-0 fill-[#f59e0b] text-[#f59e0b]" size={28} />
          <div>
            <h3 className="text-xl font-black">Share Your Experience</h3>
            <p className="mt-1 text-sm text-[#6f7b8c]">Had a service done? Tell others about it!</p>
          </div>
        </div>

        <form onSubmit={submitReview} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Your Name <span className="text-orange-600">*</span>
              <input
                name="name"
                value={form.name}
                onChange={change}
                required
                maxLength={100}
                placeholder="e.g. Ramesh Kumar"
                className="field"
              />
            </label>

            <label className="text-sm font-semibold">
              Your Area <span className="text-orange-600">*</span>
              <input
                name="area"
                value={form.area}
                onChange={change}
                required
                maxLength={120}
                placeholder="e.g. Lawspet, Pondicherry"
                className="field"
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold">
              Your Rating <span className="text-orange-600">*</span>
            </p>
            <div className="mt-1">
              <Stars
                interactive
                value={form.rating}
                onChange={(rating) => setForm((current) => ({ ...current, rating }))}
              />
            </div>
          </div>

          <label className="block text-sm font-semibold">
            Your Review <span className="text-orange-600">*</span>
            <textarea
              name="review"
              value={form.review}
              onChange={change}
              required
              maxLength={400}
              rows={4}
              placeholder="Tell us about your experience with Ayyan Service..."
              className="field resize-y"
            />
            <span className="mt-1 block text-right text-xs text-[#8b96a5]">
              {form.review.length} / 400
            </span>
          </label>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          {message && <p className="text-sm font-semibold text-green-600">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ed6509] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#d95700] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
            {saving ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
}
