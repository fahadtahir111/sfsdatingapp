"use client";

import Link from "next/link";
import { FaUser, FaBell, FaCreditCard, FaLock, FaSignOutAlt, FaChevronRight, FaBriefcase } from "react-icons/fa";
import { useAuth } from "@/app/providers/AuthProvider";
import { useState } from "react";

export default function SettingsClient() {
  const { logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const settingsLinks = [
    { name: "Account Details", href: "/settings/account", icon: <FaUser /> },
    { name: "Notifications", href: "/settings/notifications", icon: <FaBell /> },
    { name: "Professional Elite", href: "/settings/professional", icon: <FaBriefcase /> },
    { name: "Billing & Subscriptions", href: "/settings/billing", icon: <FaCreditCard /> },
    { name: "Privacy & Ghost Mode", href: "/settings/privacy", icon: <FaLock /> },
  ];

  return (
    <div className="page-shell min-h-screen bg-background pt-8 pb-24 flex flex-col">
      <h1 className="text-3xl font-black text-foreground tracking-tight mb-8">Settings</h1>
      
      <div className="flex-1 space-y-3">
        {settingsLinks.map((link) => (
          <Link href={link.href} key={link.name}>
            <div className="bg-card p-5 rounded-[1.75rem] flex items-center justify-between border border-white/5 shadow-xl active:scale-95 transition-all mb-4 group hover:border-primary/30">
              <div className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-[10px]">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary text-lg shadow-inner">
                  {link.icon}
                </div>
                {link.name}
              </div>
              <FaChevronRight className="text-muted-foreground/40 group-hover:text-primary transition-colors text-xs" />
            </div>
          </Link>
        ))}

        <div className="mt-8">
          <button
            type="button"
            disabled={isSigningOut}
            onClick={async () => {
              setIsSigningOut(true);
              try {
                await logout();
              } finally {
                setIsSigningOut(false);
              }
            }}
            className="w-full bg-card p-5 rounded-[1.75rem] flex items-center gap-4 text-red-500 font-black uppercase tracking-widest text-[10px] border border-red-500/10 shadow-xl active:scale-95 transition-all text-left disabled:opacity-60 group hover:bg-red-500/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-lg shadow-inner">
              <FaSignOutAlt />
            </div>
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>

        <div className="mt-auto pt-10 pb-4 flex flex-col items-center gap-2 opacity-20 hover:opacity-100 transition-all cursor-default">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Media Infrastructure</p>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-muted-foreground/40" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.586 7.414c-.663 0-1.285.18-1.828.487a4.99 4.99 0 0 0-3.328-1.487 4.99 4.99 0 0 0-3.328 1.487c-.543-.307-1.165-.487-1.828-.487-2.025 0-3.667 1.642-3.667 3.667 0 .195.016.386.046.572A4.326 4.326 0 0 0 2 15.333c0 2.394 1.94 4.334 4.333 4.334h11.334c2.393 0 4.333-1.94 4.333-4.334 0-2.083-1.472-3.823-3.414-4.248.03-.186.046-.377.046-.572 0-2.025-1.642-3.667-3.666-3.667z"/>
            </svg>
            <span className="text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase">Cloudinary</span>
          </div>
        </div>
      </div>

    </div>
  );
}
