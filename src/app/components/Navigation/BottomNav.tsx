"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaCommentDots, FaUser, FaVideo, FaCamera, FaCrown, FaMicrophone } from "react-icons/fa";
import { useRealTime } from "@/lib/hooks/useRealTime";
import { getPendingRequestsCount } from "@/app/friends/actions";
import { useAuth } from "@/app/providers/AuthProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = !!user?.adminRole;

  const navItems = [
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: FaCrown }] : []),
    { name: "Boardroom", href: "/boardroom", icon: FaMicrophone },
    { name: "Discover", href: "/discover", icon: FaCrown },
    { name: "Reels", href: "/reels", icon: FaVideo },
    { name: "Create", href: "/create", icon: FaCamera, central: true },
    { name: "Chat", href: "/chat", icon: FaCommentDots },
    { name: "Profile", href: "/profile", icon: FaUser, hasBadge: true },
  ];

  const { data: requestCount } = useRealTime(getPendingRequestsCount, 10000);

  // Don't render on the landing page or auth routes
  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex justify-around items-center px-2 py-3 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.central) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-5">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 bg-[#FFD700] text-black rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/20 border-[6px] border-[#f8f7f5]"
                >
                  <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                    <FaCamera className="text-white text-[10px]" />
                  </div>
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative p-2 rounded-xl transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <Icon className="text-2xl" />
                {item.hasBadge && requestCount && requestCount > 0 ? (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white"
                  >
                    {requestCount > 9 ? '9+' : requestCount}
                  </motion.div>
                ) : null}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
