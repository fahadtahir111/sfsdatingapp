"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaCommentDots, FaUser, FaVideo, FaFire, FaHome } from "react-icons/fa";
import { useRealTime } from "@/lib/hooks/useRealTime";
import { getPendingRequestsCount } from "@/app/friends/actions";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/feed", icon: FaHome },
    { name: "Discover", href: "/discover", icon: FaFire },
    { name: "Reels", href: "/reels", icon: FaVideo },
    { name: "Chat", href: "/chat", icon: FaCommentDots },
    { name: "Profile", href: "/profile", icon: FaUser, hasBadge: true },
  ];

  const { data: requestCount } = useRealTime(getPendingRequestsCount, 10000);

  // Hide completely on auth routes and landing page
  if (pathname === "/" || pathname.startsWith("/auth")) return null;
  
  // Hide on immersive screens like individual chat threads
  if (pathname.startsWith("/chat/") && pathname !== "/chat") return null;


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-t border-white/5 pb-safe">
      <div className="flex justify-around items-center px-2 py-3 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`relative p-2 rounded-xl transition-all duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                }`}
              >
                <Icon className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                {item.hasBadge && requestCount && requestCount > 0 ? (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-0 w-4 h-4 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black"
                  >
                    {requestCount > 9 ? '9+' : requestCount}
                  </motion.div>
                ) : null}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

