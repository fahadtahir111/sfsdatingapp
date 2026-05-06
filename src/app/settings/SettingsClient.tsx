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
    <div className="page-shell min-h-screen bg-background pt-8 pb-24 px-6 flex flex-col">
      <h1 className="text-4xl font-heading text-white tracking-tight mb-10">Settings</h1>
      
      <div className="flex-1 space-y-4">
        {settingsLinks.map((link) => (
          <Link href={link.href} key={link.name}>
            <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5 shadow-xl active:scale-98 transition-all group hover:bg-white/10 hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-primary text-base border border-white/10 shadow-shadow-glow">
                  {link.icon}
                </div>
                <span className="sub-heading text-[11px] text-white lowercase">{link.name}</span>
              </div>
              <FaChevronRight className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-[10px]" />
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
            className="w-full bg-white/5 p-4 rounded-xl flex items-center gap-4 text-red-500 border border-white/5 shadow-xl active:scale-98 transition-all text-left disabled:opacity-40 group hover:bg-red-500/10 hover:border-red-500/20"
          >
            <div className="w-12 h-12 rounded-lg bg-red-500/5 flex items-center justify-center text-base border border-red-500/10 shadow-inner">
              <FaSignOutAlt />
            </div>
            <span className="sub-heading text-[11px] lowercase">{isSigningOut ? "signing out..." : "sign out"}</span>
          </button>
        </div>

        <div className="mt-auto pt-12 pb-4 flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-all cursor-default">
          <p className="sub-heading text-[8px] text-muted-foreground/40 lowercase">media infrastructure powered by</p>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-primary" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.586 7.414c-.663 0-1.285.18-1.828.487a4.99 4.99 0 0 0-3.328-1.487 4.99 4.99 0 0 0-3.328 1.487c-.543-.307-1.165-.487-1.828-.487-2.025 0-3.667 1.642-3.667 3.667 0 .195.016.386.046.572A4.326 4.326 0 0 0 2 15.333c0 2.394 1.94 4.334 4.333 4.334h11.334c2.393 0 4.333-1.94 4.333-4.334 0-2.083-1.472-3.823-3.414-4.248.03-.186.046-.377.046-.572 0-2.025-1.642-3.667-3.666-3.667z"/>
            </svg>
            <span className="sub-heading text-[10px] text-primary lowercase">cloudinary</span>
          </div>
        </div>
      </div>

    </div>
  );
}
