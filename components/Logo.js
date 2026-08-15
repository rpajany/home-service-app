import Link from "next/link";

export default function Logo() {
  return <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-[#151226]">
    <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#7045e8]">
      <span className="absolute h-1.5 w-8 -rotate-12 rounded-full bg-white/90 -top-0.5" />
      <span className="absolute h-1.5 w-8 -rotate-12 rounded-full bg-white/90 top-3" />
      <span className="absolute h-1.5 w-8 -rotate-12 rounded-full bg-white/90 top-6" />
    </span>
    <span className="text-[20px]">Logoipsum</span>
  </Link>;
}
