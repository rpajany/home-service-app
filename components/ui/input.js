import { cn } from "@/lib/utils";
export function Input({ className, ...props }) {
  return <input className={cn("h-11 w-full rounded-md border border-[#ded9e6] bg-white px-3 text-sm outline-none placeholder:text-[#9b97a5] focus:border-[#7045e8] focus:ring-2 focus:ring-[#7045e8]/10", className)} {...props} />;
}
