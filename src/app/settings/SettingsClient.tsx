"use client";

import Link from "next/link";
import { FaUser, FaBell, FaCreditCard, FaLock, FaSignOutAlt, FaChevronRight, FaBriefcase } from "react-icons/fa";
import { useAuth } from "@/app/providers/AuthProvider";

export default function SettingsClient() {
  const { logout } = useAuth();

  const settingsLinks = [
    { name: "Account Details", href: "/settings/account", icon: <FaUser /> },
    { name: "Notifications", href: "/settings/notifications", icon: <FaBell /> },
    { name: "Professional Elite", href: "/settings/professional", icon: <FaBriefcase /> },
    { name: "Billing & Subscriptions", href: "/settings/billing", icon: <FaCreditCard /> },
    { name: "Privacy & Ghost Mode", href: "/settings/privacy", icon: <FaLock /> },
  ];

  return (
    <div className="min-h-screen bg-secondary/20 pt-8 px-4 pb-24 flex flex-col">
      <h1 className="text-3xl font-black text-black tracking-tight mb-8 ml-2">Settings</h1>
      
      <div className="flex-1 space-y-3">
        {settingsLinks.map((link) => (
          <Link href={link.href} key={link.name}>
            <div className="bg-white p-5 rounded-2xl flex items-center justify-between border border-border shadow-sm active:scale-95 transition-all mb-3">
              <div className="flex items-center gap-4 text-foreground font-bold">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                  {link.icon}
                </div>
                {link.name}
              </div>
              <FaChevronRight className="text-muted-foreground text-sm" />
            </div>
          </Link>
        ))}

        <div className="mt-8">
          <button
            type="button"
            onClick={logout}
            className="w-full bg-white p-5 rounded-2xl flex items-center gap-4 text-red-500 font-bold border border-red-500/20 shadow-sm active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <FaSignOutAlt />
            </div>
            Sign Out
          </button>
        </div>

        <div className="mt-auto pt-10 pb-4 flex flex-col items-center gap-2 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Media Infrastructure</p>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#3448C5]" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.586 7.414c-.663 0-1.285.18-1.828.487a4.99 4.99 0 0 0-3.328-1.487 4.99 4.99 0 0 0-3.328 1.487c-.543-.307-1.165-.487-1.828-.487-2.025 0-3.667 1.642-3.667 3.667 0 .195.016.386.046.572A4.326 4.326 0 0 0 2 15.333c0 2.394 1.94 4.334 4.333 4.334h11.334c2.393 0 4.333-1.94 4.333-4.334 0-2.083-1.472-3.823-3.414-4.248.03-.186.046-.377.046-.572 0-2.025-1.642-3.667-3.666-3.667z"/>
            </svg>
            <span className="text-sm font-black tracking-tighter text-stone-700">Cloudinary</span>
          </div>
        </div>
      </div>

    </div>
  );
}
