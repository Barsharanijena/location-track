import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Delivery PWA",
  description: "Address lookup and live delivery agent tracking for Maharashtra",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Delivery PWA", statusBarStyle: "default" },
  icons: { apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <span className="font-semibold text-brand-600 text-lg">DeliveryPWA</span>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              Address Lookup
            </Link>
            <Link
              href="/tracking"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              Live Tracking
            </Link>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
