"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";

function OAuthButton({ provider, label, icon, nextPath }) {
  const href = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(
    nextPath || "/"
  )}`;

  return (
    <a href={href} className="block">
      <Button
        type="button"
        variant="outline"
        className="w-full border-[#d9d3e4] text-[#292332] hover:bg-[#faf7ff]"
      >
        {icon}
        <span>{label}</span>
      </Button>
    </a>
  );
}

export default function LoginForm() {
  const params = useSearchParams();

  const [nextPath, setNextPath] = useState("/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = params.get("next");

    if (next) {
      setNextPath(next);
    }
  }, [params]);

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }

      window.location.href =
        data.user?.role === "admin" ? "/admin" : nextPath;
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-4 py-10">
      <div className="mx-auto w-full max-w-[540px] rounded-xl bg-white p-7 shadow-xl sm:p-10">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7045e8] text-white shadow-sm">
            <LogIn size={30} />
          </div>
        </div>

        <h1 className="mt-6 text-center text-3xl font-black">
          Login
        </h1>

        <p className="mx-auto mt-3 max-w-md text-center text-sm text-[#66616f]">
          Sign in to access your home services and bookings.
        </p>

        {/* OAuth temporarily hidden; providers are kept in the code for later enablement. */}

        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[#777481]">
          New to our service?{" "}
          <Link
            href={`/signup${
              nextPath && nextPath !== "/"
                ? `?next=${encodeURIComponent(nextPath)}`
                : ""
            }`}
            className="font-bold text-[#7045e8]"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}