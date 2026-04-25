import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import BottomNav from "./components/Navigation/BottomNav";
import GlobalSignaling from "./components/GlobalSignaling";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "SFS Elite | Exclusive Dating & Networking",
  description: "Join the most exclusive community of founders, creators, and professionals. Elite dating and professional networking for the ambitious.",
  keywords: ["dating", "networking", "exclusive", "elite", "entrepreneurs", "founders"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SFS Elite",
  },
};

import Sidebar from "./components/Navigation/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body
        suppressHydrationWarning
        className="antialiased bg-[#f8f7f5] text-stone-900 font-sans min-h-screen"
      >
        <AuthProvider>
          <GlobalSignaling />
          <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f7f5] overflow-x-hidden">
            <Sidebar />
            <main className="flex-1 w-full relative min-h-screen md:h-screen md:overflow-y-auto no-scrollbar">
              <div className="max-w-screen-2xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
