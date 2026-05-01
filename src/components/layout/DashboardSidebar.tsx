"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Mic, 
  Search, 
  User as UserIcon, 
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Compass,
  Play
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

const navItems = [
  { name: "Feed", href: "/feed", icon: Compass },
  { name: "Discover", href: "/discover", icon: Search },
  { name: "Reels", href: "/reels", icon: Play },
  { name: "Boardroom", href: "/boardroom", icon: Mic },
  { name: "Messages", href: "/chat", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export function DashboardSidebar({ 
  isCollapsed, 
  setIsCollapsed 
}: { 
  isCollapsed: boolean; 
  setIsCollapsed: (v: boolean) => void; 
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside 
      className={cn(
        "h-screen fixed left-0 top-0 bg-[#0a0a0a] border-r border-white/5 hidden md:flex flex-col transition-all duration-500 z-50",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand */}
      <div className="p-6 mb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black shrink-0 shadow-lg shadow-yellow-400/20">
            S
          </div>
          {!isCollapsed && (
            <span className="font-black text-xl tracking-tighter text-white">SFS <span className="text-yellow-400">ELITE</span></span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 relative",
                isActive 
                  ? "bg-yellow-400 text-black shadow-xl shadow-yellow-400/20" 
                  : "text-stone-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-black" : "group-hover:scale-110 transition-transform")} />
              {!isCollapsed && (
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="absolute right-4">
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card (Magic UI Style) */}
      {!isCollapsed && (
        <div className="px-6 py-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform">
              <Sparkles className="w-20 h-20 text-black" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black/40 mb-2">Membership</h4>
            <p className="text-sm font-black mb-4 text-black">Elevate your access with <span className="underline decoration-black/20">Elite</span></p>
            <button className="w-full bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          href="/settings"
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-stone-500 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-bold text-sm">Settings</span>}
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-stone-900 border border-white/10 rounded-full shadow-md flex items-center justify-center text-stone-500 hover:text-yellow-400 transition-colors"
      >
        <ChevronRight className={cn("w-3 h-3 transition-transform duration-300", isCollapsed ? "" : "rotate-180")} />
      </button>
    </aside>
  );
}
