import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Logoipsum Home Services", description: "Find trusted home services near you." };

export default function RootLayout({ children }) {
  return <html lang="en"><body className="flex min-h-screen flex-col"><Header/><div className="flex-1">{children}</div><Footer/></body></html>;
}
