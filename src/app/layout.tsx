import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import "./globals.css";
import GlobalSignaling from "./components/GlobalSignaling";
import AppWrapper from "./providers/AppWrapper";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#c9a227",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body
        suppressHydrationWarning
        className="antialiased bg-background text-foreground font-sans min-h-screen selection:bg-primary/20"
      >
        <AppWrapper initialUser={user ? { id: user.id, name: user.name } : null}>
          <GlobalSignaling />
          {/* 
              Root structure is now clean. 
              The Landing Page and Dashboard will handle their own layout constraints.
          */}
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}

