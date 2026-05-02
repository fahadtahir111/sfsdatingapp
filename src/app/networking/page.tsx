"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBriefcase, FaLinkedin, FaHandshake, FaStar, FaCheckCircle,
  FaPlus, FaBuilding, FaGlobe, FaArrowRight, FaUsers
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface NetworkUser {
  id: string;
  name: string | null;
  avatar: string;
  occupation: string | null;
  company: string | null;
  industry: string | null;
  professionalVerified: boolean;
  trustScore: number;
}

export default function NetworkingPage() {
  const [members, setMembers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Founders", "Investors", "Creators", "Executives"];

  useEffect(() => {
    fetch("/api/users/search?q=&networking=true")
      .then((r) => r.json())
      .then((data) => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <FaBriefcase className="text-black" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Elite Networking</span>
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">
              Connect with <span className="text-primary">Elite Professionals</span>
            </h2>
            <p className="text-muted-foreground text-sm font-medium max-w-sm">
              Founders, investors, and creators who match your ambition level.
            </p>
            <Link
              href="/settings/professional"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <FaPlus /> Enable Networking Mode
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: FaUsers, label: "Elite Pros", val: "2.4K" },
            { icon: FaHandshake, label: "Connections", val: "500+" },
            { icon: FaStar, label: "Verified", val: "94%" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-4 text-center"
            >
              <s.icon className="text-primary text-lg mx-auto mb-2" />
              <div className="text-xl font-black text-foreground">{s.val}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeFilter === f
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Members Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Members in Networking Mode</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-secondary border border-border rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBriefcase className="text-muted-foreground text-xl" />
              </div>
              <p className="text-foreground font-black text-sm">No networking members yet</p>
              <p className="text-muted-foreground text-xs mt-1">Be the first to enable networking mode!</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {members.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-4 bg-card border border-border rounded-3xl p-4 hover:border-primary/30 hover:bg-card/80 transition-all group"
                    >
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-secondary flex-shrink-0 border border-border">
                        <Image src={user.avatar} alt={user.name || "Member"} fill className="object-cover" />
                        {user.professionalVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-card">
                            <FaCheckCircle className="text-white text-[7px]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-foreground text-sm truncate">{user.name || "Anonymous"}</p>
                        {user.occupation && (
                          <p className="text-xs text-muted-foreground font-medium truncate mt-0.5 flex items-center gap-1">
                            <FaBriefcase className="text-[9px]" /> {user.occupation}
                          </p>
                        )}
                        {user.company && (
                          <p className="text-xs text-primary/80 font-medium truncate mt-0.5 flex items-center gap-1">
                            <FaBuilding className="text-[9px]" /> {user.company}
                          </p>
                        )}
                        {user.industry && (
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                            <FaGlobe className="text-[9px]" /> {user.industry}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {user.professionalVerified && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">
                            Verified
                          </span>
                        )}
                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                          <FaArrowRight className="text-muted-foreground group-hover:text-black text-[10px] transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* CTA Card */}
        <div className="bg-card border border-border rounded-3xl p-6 text-center">
          <FaLinkedin className="text-[#0077B5] text-3xl mx-auto mb-3" />
          <h4 className="font-black text-foreground mb-2">Verify Your Professional Identity</h4>
          <p className="text-xs text-muted-foreground font-medium mb-5 max-w-xs mx-auto">
            Link your LinkedIn to get the verified badge and unlock priority placement in the network.
          </p>
          <Link
            href="/settings/professional"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#0077B5]/20 border border-[#0077B5]/30 text-[#0077B5] text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#0077B5]/30 transition-colors"
          >
            <FaLinkedin /> Link LinkedIn
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
