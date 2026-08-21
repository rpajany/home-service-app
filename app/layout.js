import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContactActions from "@/components/FloatingContactActions";

export const metadata = {
  title: "Home Services",
  description: "Find trusted home services near you.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col pb-20 md:pb-0">
        <Header />

        <div className="flex-1">
          {children}
        </div>

        <Footer />
        <FloatingContactActions />
      </body>
    </html>
  );
}
