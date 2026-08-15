"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";

export default function SignupForm() {
     const router = useRouter(); const params = useSearchParams();
  const nextPath = params.get("next") || "/";
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e){e.preventDefault();setError("");if(password!==confirm){setError("Passwords do not match.");return;}setLoading(true);try{const res=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});const data=await res.json();if(!res.ok){setError(data.error||"Unable to create account.");return;}router.push(data.user?.role === "admin" ? "/admin" : nextPath);}catch{setError("Unable to create account. Please try again.");}finally{setLoading(false);}}
  return <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-4 py-10"><div className="mx-auto w-full max-w-[540px] rounded-xl bg-white p-7 shadow-xl sm:p-10"><div className="flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7045e8] text-white shadow-sm"><UserPlus size={30}/></div></div><h1 className="mt-6 text-center text-3xl font-black">Signup</h1><p className="mt-3 text-center text-sm text-[#66616f]">Create your account with your email and password.</p><form onSubmit={submit} className="mt-7 space-y-4"><Input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required/><Input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/><Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/><Input type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={6}/>{error&&<p className="text-sm font-semibold text-red-600">{error}</p>}<Button className="w-full" disabled={loading}>{loading?"Creating account...":"Create Account"}</Button></form><p className="mt-5 text-center text-sm text-[#777481]">Already have an account? <Link href={`/login${nextPath!=="/"?`?next=${encodeURIComponent(nextPath)}`:""}`} className="font-bold text-[#7045e8]">Sign in</Link></p></div></main>;
}