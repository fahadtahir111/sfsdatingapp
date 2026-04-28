"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// motion removed
import { FaCompass, FaCommentDots, FaUser, FaVideo, FaCrown, FaSignOutAlt, FaMicrophone, FaSearch } from "react-icons/fa";
import { useRealTime } from "@/lib/hooks/useRealTime";
import { getPendingRequestsCount } from "@/app/friends/actions";
import { useAuth } from "@/app/providers/AuthProvider";
import CreateReelCTA from "../Feed/CreateReelCTA";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const isAdmin = !!user?.adminRole;

  const navItems = [
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: FaCrown }] : []),
    { name: "Society Feed", href: "/feed", icon: FaCompass },
    { name: "Search", href: "/search", icon: FaSearch },
    { name: "Discover", href: "/discover", icon: FaCrown },
    { name: "Reels", href: "/reels", icon: FaVideo },
    { name: "Messages", href: "/chat", icon: FaCommentDots },
    { name: "Boardroom", href: "/boardroom", icon: FaMicrophone },
    { name: "My Profile", href: "/profile", icon: FaUser, hasBadge: true },
  ];

  const { data: requestCount } = useRealTime(getPendingRequestsCount, 10000);

  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  return (
    <div className="hidden md:flex flex-col w-64 lg:w-72 border-r border-stone-100 h-screen sticky top-0 bg-white p-6">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-black text-stone-900 tracking-tighter italic">SFS ELITE</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                isActive 
                  ? "bg-stone-900 text-white shadow-lg shadow-stone-200" 
                  : "text-stone-400 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <div className="relative">
                <Icon className="text-xl" />
                {item.hasBadge && requestCount && requestCount > 0 ? (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white" />
                ) : null}
              </div>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <CreateReelCTA variant="sidebar" />
        <button 
          onClick={() => logout()}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all font-bold text-sm"
        >
          <FaSignOutAlt />
          Sign Out
        </button>
      </div>
    </div>
  );
}
