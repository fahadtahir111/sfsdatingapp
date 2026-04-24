"use client";

import Link from "next/link";
import { FaUser, FaBell, FaCreditCard, FaLock, FaSignOutAlt, FaChevronRight } from "react-icons/fa";

export default function SettingsClient() {
  const settingsLinks = [
    { name: "Account Details", href: "/settings/account", icon: <FaUser /> },
    { name: "Notifications", href: "/settings/notifications", icon: <FaBell /> },
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
          <Link href="/api/auth/signout">
            <div className="bg-white p-5 rounded-2xl flex items-center gap-4 text-red-500 font-bold border border-red-500/20 shadow-sm active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <FaSignOutAlt />
              </div>
              Sign Out
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
