"use client";

import { useState, useEffect } from "react";
import { getActiveBoardrooms, createBoardroom } from "./actions";
import { FaPlus, FaUsers, FaMicrophone, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "@/app/providers/ToastProvider";

type BoardroomListItem = {
  id: string;
  title: string;
  host: {
    name: string | null;
    profile: {
      photos: string | null;
    } | null;
  };
};

export default function BoardroomPage() {
  const [rooms, setRooms] = useState<BoardroomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    getActiveBoardrooms().then(data => {
      setRooms(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!title) return;
    setIsCreating(true);
    try {
      const room = await createBoardroom(title);
      router.push(`/boardroom/${room.id}`);
    } catch {
      showToast("Failed to create boardroom", "error");
      setIsCreating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5]"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-[#f8f7f5] pb-24">
      {/* Header */}
      <div className="bg-white p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-stone-400">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">The Boardroom</h1>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/20" />
      </div>

      <div className="p-6 space-y-8">
        {/* Hero Section */}
        <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FaMicrophone className="text-9xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2">Live Networking</h2>
            <p className="text-stone-400 text-sm mb-6 max-w-xs leading-relaxed">
              Join exclusive audio discussions with founders and creators currently in SFS Elite.
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Topic: Building a SaaS..."
                className="flex-1 bg-white/10 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button 
                onClick={handleCreate}
                disabled={isCreating}
                className="w-12 h-12 bg-yellow-400 text-stone-900 rounded-2xl flex items-center justify-center font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl"
              >
                {isCreating ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              </button>
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-2">Active Sessions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <button 
                key={room.id}
                onClick={() => router.push(`/boardroom/${room.id}`)}
                className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm text-left hover:border-yellow-400 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-stone-100 relative">
                      {(() => {
                        let photoUrl = `https://ui-avatars.com/api/?name=${room.host.name}`;
                        try {
                          const photos = JSON.parse(room.host.profile?.photos || "[]");
                          if (photos.length > 0) photoUrl = photos[0];
                        } catch {}
                        return (
                          <Image 
                            src={photoUrl} 
                            alt="Host" 
                            fill 
                            className="object-cover" 
                          />
                        );
                      })()}
                    </div>
                  </div>
                  <div className="bg-stone-50 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-tighter">
                    <FaUsers />
                    <span>Live Now</span>
                  </div>
                </div>
                
                <h4 className="text-lg font-black text-stone-900 mb-1 group-hover:text-yellow-600 transition-colors">
                  {room.title}
                </h4>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                  Hosted by {room.host.name}
                </p>
              </button>
            ))}

            {rooms.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-stone-400 italic text-sm">No active boardrooms. Start one above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
