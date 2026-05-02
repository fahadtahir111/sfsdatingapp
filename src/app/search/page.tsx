"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaShieldAlt, FaCrown, FaStar, FaTimes } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface UserResult {
  id: string;
  name: string | null;
  avatar: string;
  occupation: string | null;
  trustScore: number;
  professionalVerified: boolean;
  tier: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Discover Members</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">Connect with high-performers in the network.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <FaSearch className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search by name, occupation, or expertise..."
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </form>

        <div className="space-y-3 pt-2">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && searched && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-muted-foreground text-lg" />
              </div>
              <p className="text-foreground font-black text-sm">No members found</p>
              <p className="text-muted-foreground text-xs mt-1 font-medium">Try a different name or occupation</p>
            </motion.div>
          )}

          {/* Initial prompt */}
          {!loading && !searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/10">
                <FaSearch className="text-primary text-2xl" />
              </div>
              <p className="text-foreground font-black text-sm tracking-tight">Discover Elite Members</p>
              <p className="text-muted-foreground text-xs mt-1 font-medium">Search to connect with the elite circle</p>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {!loading &&
              results.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-4 bg-card rounded-3xl p-4 border border-border hover:border-primary/30 hover:bg-card/80 transition-all active:scale-[0.98] shadow-sm group"
                  >
                    {/* Avatar */}
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-secondary flex-shrink-0 border border-border">
                      <Image
                        src={user.avatar}
                        alt={user.name || "Member"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={user.avatar.startsWith("https://ui-avatars.com")}
                      />
                      {user.professionalVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-card">
                          <FaShieldAlt className="text-white text-[7px]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-black text-foreground truncate">
                          {user.name || "Anonymous"}
                        </p>
                        {user.tier === "Elite" && (
                          <FaCrown className="text-primary text-[10px] flex-shrink-0" />
                        )}
                        {user.tier === "Signature" && (
                          <FaStar className="text-amber-400 text-[10px] flex-shrink-0" />
                        )}
                      </div>
                      {user.occupation && (
                        <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                          {user.occupation}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="h-1 w-16 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-pink-400"
                            style={{ width: `${Math.min(100, user.trustScore)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                          Trust {user.trustScore}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:border-primary transition-all">
                      <span className="text-muted-foreground group-hover:text-black text-sm font-black transition-colors">›</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
