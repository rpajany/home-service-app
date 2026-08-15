import { cn } from "@/lib/utils";

export function Button({ className, variant="default", size="default", ...props }) {
  const variants = {
    default: "bg-[#7045e8] text-white hover:bg-[#5b32cf]",
    outline: "border border-[#dcd5e8] bg-white hover:bg-[#f7f4fb] text-[#292332]",
    ghost: "bg-transparent hover:bg-[#f4efff] text-[#302b3a]",
    soft: "bg-[#f4efff] text-[#6d42d7] hover:bg-[#ebe2ff]"
  };
  const sizes = { sm: "h-9 px-4 text-sm", default: "h-11 px-5", lg: "h-12 px-7 text-base" };
  return <button className={cn("inline-flex items-center justify-center rounded-md font-semibold transition disabled:opacity-50 disabled:pointer-events-none", variants[variant], sizes[size], className)} {...props} />;
}
