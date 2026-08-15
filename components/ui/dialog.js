"use client";
import { X } from "lucide-react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onOpenChange(false)}>{children}</div>;
}
export function DialogContent({ children, className="" }) {
  return <div className={`relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${className}`}>
    {children}
  </div>;
}
export function DialogClose({ onClick }) {
  return <button onClick={onClick} className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={18}/></button>;
}
