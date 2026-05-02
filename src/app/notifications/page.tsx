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
      case "LIKE": return <FaHeart className="text-primary" />;
      case "FRIEND_REQUEST": return <FaUserPlus className="text-blue-400" />;
      case "MATCH": return <FaFire className="text-orange-500" />;
      case "MESSAGE": return <FaCommentDots className="text-green-400" />;
      default: return <FaBell className="text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Notifications</h1>
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-1">
              Your elite activity feed
            </p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => setNotifications([])}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <NotificationsLoading />
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-[2.5rem] border border-border shadow-xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBell className="text-muted-foreground text-2xl" />
            </div>
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
              No new alerts in the circle
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group relative bg-card border border-border p-5 rounded-3xl hover:border-primary/20 transition-all shadow-lg ${!n.isRead ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex gap-4">
                    <div className="relative">
                      {n.sender?.image ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden relative border border-white/5 shadow-inner">
                          <Image src={n.sender.image} alt={n.sender.name || ""} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-white/5">
                          <span className="text-lg">{getIcon(n.type)}</span>
                        </div>
                      )}
                      {!n.sender?.image && (
                         <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card rounded-lg flex items-center justify-center text-[10px] border border-border shadow-sm">
                           {getIcon(n.type)}
                         </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-sm text-foreground truncate uppercase tracking-tight">
                          {n.title}
                        </h3>
                        <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap ml-2">
                          {formatRelativeTime(new Date(n.createdAt))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                      
                      {n.link && (
                        <Link 
                          href={n.link} 
                          onClick={() => markAsRead(n.id)}
                          className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-2 transition-all"
                        >
                          View Details <span className="text-xs">→</span>
                        </Link>
                      )}
                    </div>

                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        <div className="text-center pt-8 pb-12">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            SFS Elite Security System · 256-bit Encryption
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
