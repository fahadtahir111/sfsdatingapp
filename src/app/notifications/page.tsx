"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaHeart, FaUserPlus, FaFire, FaCommentDots, FaTrash } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Image from "next/image";
import Link from "next/link";
import NotificationsLoading from "./loading";

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

interface Notification {
  id: string;
  type: "LIKE" | "FRIEND_REQUEST" | "MATCH" | "MESSAGE";
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        // Map the API data to our notification interface
        interface APINotification {
          id: string;
          createdAt: string;
          sender: {
            id: string;
            name: string | null;
            image: string | null;
          };
          user: {
            id: string;
            name: string | null;
            image: string | null;
          };
        }

        const aggregated: Notification[] = [
          ...data.friendRequests.map((r: APINotification) => ({
            id: r.id,
            type: "FRIEND_REQUEST",
            title: "New Friend Request",
            content: `${r.sender.name} wants to connect with you.`,
            isRead: false,
            createdAt: r.createdAt,
            sender: r.sender,
            link: "/friends"
          })),
          ...data.likes.map((l: APINotification) => ({
            id: l.id,
            type: "LIKE",
            title: "Someone Liked You",
            content: `A member showed interest in your profile.`,
            isRead: false,
            createdAt: l.createdAt,
            link: "/likes"
          })),
          ...data.matches.map((m: APINotification) => ({
            id: m.id,
            type: "MATCH",
            title: "New Match!",
            content: `You and ${m.user.name} have matched.`,
            isRead: false,
            createdAt: m.createdAt,
            sender: m.user,
            link: `/chat/${m.id}`
          }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setNotifications(aggregated);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE": return <FaHeart className="text-primary shadow-shadow-glow" />;
      case "FRIEND_REQUEST": return <FaUserPlus className="text-primary shadow-shadow-glow" />;
      case "MATCH": return <FaFire className="text-primary shadow-shadow-glow" />;
      case "MESSAGE": return <FaCommentDots className="text-primary shadow-shadow-glow" />;
      default: return <FaBell className="text-muted-foreground/50" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-10 relative">
        <div className="aether-mesh absolute inset-0 pointer-events-none opacity-20 -z-10" />
        
        <div className="flex items-end justify-between px-2">
          <div>
            <h1 className="text-4xl font-heading text-white tracking-tight">Notifications</h1>
            <p className="sub-heading text-[10px] lowercase text-primary/60 mt-1">
              Your aether activity feed
            </p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => setNotifications([])}
              className="sub-heading text-[9px] text-white/30 hover:text-primary transition-colors lowercase"
            >
              clear all
            </button>
          )}
        </div>

        {loading ? (
          <NotificationsLoading />
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl">
              <FaBell className="text-white/20 text-xl" />
            </div>
            <p className="sub-heading text-[11px] text-white/30 lowercase">
              no new alerts in the circle
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            <AnimatePresence mode="popLayout">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`group relative bg-white/5 backdrop-blur-xl border border-white/5 p-5 rounded-[24px] hover:bg-white/10 hover:border-primary/20 transition-all shadow-xl ${!n.isRead ? 'after:absolute after:left-0 after:top-6 after:bottom-6 after:w-1 after:bg-primary after:rounded-r-full after:shadow-shadow-glow' : ''}`}
                >
                  <div className="flex gap-5">
                    <div className="relative flex-shrink-0">
                      {n.sender?.image ? (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
                          <Image src={n.sender.image} alt={n.sender.name || ""} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" unoptimized />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                          <span className="text-xl">{getIcon(n.type)}</span>
                        </div>
                      )}
                      {!n.sender?.image && (
                         <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-lg flex items-center justify-center text-[10px] border border-white/10 shadow-shadow-glow">
                           {getIcon(n.type)}
                         </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-heading text-sm text-white tracking-tight truncate">
                          {n.title}
                        </h3>
                        <span className="sub-heading text-[9px] text-white/20 whitespace-nowrap ml-2 lowercase">
                          {formatRelativeTime(new Date(n.createdAt))}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-medium line-clamp-1 leading-relaxed lowercase">
                        {n.content}
                      </p>
                      
                      {n.link && (
                        <Link 
                          href={n.link} 
                          onClick={() => markAsRead(n.id)}
                          className="inline-flex items-center gap-2 mt-3 sub-heading text-[10px] text-primary hover:gap-3 transition-all lowercase"
                        >
                          view details <span className="text-[8px]">→</span>
                        </Link>
                      )}
                    </div>

                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        <div className="text-center pt-12 pb-16 opacity-30">
          <p className="sub-heading text-[9px] text-white/40 lowercase tracking-[0.5em]">
            aether security protocol · 256-bit encryption
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
