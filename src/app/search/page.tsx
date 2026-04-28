"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSearch, FaArrowLeft, FaShieldAlt, FaCrown, FaStar } from "react-icons/fa";

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
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-[#f8f7f5] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              id="search-users-input"
              type="text"
              autoFocus
              value={query}
              onChange={handleChange}
              placeholder="Search members by name…"
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
            />
          </form>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-3">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-stone-400 text-lg" />
            </div>
            <p className="text-stone-900 font-black text-sm">No members found</p>
            <p className="text-stone-400 text-xs mt-1 font-medium">
              Try a different name
            </p>
          </motion.div>
        )}

        {/* Prompt */}
        {!loading && !searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-stone-900/20">
              <FaSearch className="text-white text-xl" />
            </div>
            <p className="text-stone-900 font-black text-sm tracking-tight">Discover Members</p>
            <p className="text-stone-400 text-xs mt-1 font-medium">
              Search to connect with the elite circle
            </p>
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
                  className="flex items-center gap-4 bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all active:scale-[0.98]"
                >
                  {/* Avatar */}
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-stone-100 flex-shrink-0 border-2 border-white shadow-sm">
                    <Image
                      src={user.avatar}
                      alt={user.name || "Member"}
                      fill
                      className="object-cover"
                      unoptimized={user.avatar.startsWith("https://ui-avatars.com")}
                    />
                    {user.professionalVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <FaShieldAlt className="text-white text-[7px]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-black text-stone-900 truncate">
                        {user.name || "Anonymous"}
                      </p>
                      {user.tier === "Elite" && (
                        <FaCrown className="text-yellow-500 text-[10px] flex-shrink-0" />
                      )}
                      {user.tier === "Signature" && (
                        <FaStar className="text-amber-400 text-[10px] flex-shrink-0" />
                      )}
                    </div>
                    {user.occupation && (
                      <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                        {user.occupation}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="h-1 w-16 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                          style={{ width: `${Math.min(100, user.trustScore)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                        Trust {user.trustScore}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-stone-400 text-sm font-black">›</span>
                  </div>
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
