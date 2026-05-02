"use client";

import React from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Bell } from "lucide-react";

import BottomNav from "@/app/components/Navigation/BottomNav";
import { useAuth } from "@/app/providers/AuthProvider";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ 
  children,
  fullWidth = false
}: { 
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-white overflow-x-hidden">
      {/* Desktop Sidebar */}
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className={cn(
        "flex-1 flex flex-col min-w-0 min-h-screen relative transition-all duration-500",
        isCollapsed ? "md:ml-20" : "md:ml-72"
      )}>
        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Header - Desktop Only */}
        <header className="hidden md:flex h-20 bg-black/40 backdrop-blur-2xl border-b border-white/5 items-center justify-between px-8 sticky top-0 z-40">
          <div />
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white">{user?.name || "Member"}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {user?.tier || "Elite Member"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-card border border-white/10 overflow-hidden relative shadow-[0_0_20px_rgba(219,39,119,0.1)]">
                {user?.image ? (
                  <Image src={user.image} alt={user.name || "User"} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white font-black text-xs uppercase">
                    {(user?.name || "M").substring(0, 2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-black border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <span className="font-black text-lg tracking-tighter">SFS <span className="text-primary">ELITE</span></span>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-black text-[10px]">
            {(user?.name || "M").substring(0, 1)}
          </div>
        </header>

        {/* Content */}
        <main className={cn("flex-1 relative z-10", fullWidth ? "p-0" : "p-4 md:p-8 pb-24 md:pb-8")}>
          <div className={cn("h-full", !fullWidth && "max-w-6xl mx-auto")}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

