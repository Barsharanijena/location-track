import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeliveryPWA — Barsharani Jena",
  description: "Address lookup and live delivery agent tracking for Maharashtra",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "DeliveryPWA", statusBarStyle: "default" },
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
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold shadow">
                D
              </div>
              <div>
                <span className="font-bold text-brand-600 text-base leading-none">DeliveryPWA</span>
                <span className="ml-2 text-xs text-slate-400">by Barsharani Jena</span>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                Address Lookup
              </Link>
              <Link
                href="/tracking"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                Live Tracking
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
          Built by <span className="font-medium text-slate-600">Barsharani Jena</span> · Next.js PWA · OpenStreetMap · Leaflet
        </footer>
      </body>
    </html>
  );
}
