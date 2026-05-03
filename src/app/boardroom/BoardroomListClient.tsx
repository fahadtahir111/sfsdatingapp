"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUsers, FaMicrophone, FaSpinner } from "react-icons/fa";
import { createBoardroom, getActiveBoardrooms } from "./actions";
import { useToast } from "@/app/providers/ToastProvider";
import { useRealTime } from "@/lib/hooks/useRealTime";

type RoomListItem = {
  id: string;
  title: string;
  host: { name: string | null; profile: { photos: string | null; trustScore: number | null } | null };
};

export default function BoardroomListClient({
  initialRooms,
}: {
  initialRooms: RoomListItem[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const { data: liveRooms } = useRealTime(getActiveBoardrooms, 5000, []);
  const rooms = (liveRooms as RoomListItem[]) ?? initialRooms;
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        const room = await createBoardroom(title.trim());
        router.push(`/boardroom/${room.id}`);
      } catch {
        showToast("Failed to create boardroom", "error");
      }
    });
  };

  return (
    <div className="space-y-12">
      {/* Create Section */}
      <div className="surface-card p-10 bg-luxury-mesh relative overflow-hidden group border-primary/20">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform">
          <FaMicrophone className="text-[12rem] text-primary" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-black mb-4 tracking-tight">Host a Session</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed font-medium">
            Share insights, pitch ideas, or network with the most ambitious members of the network.
          </p>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Room Title (e.g. Scaling to $10M ARR)"
              className="flex-1 bg-secondary/50 border border-border rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground text-foreground"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={isPending || !title.trim()}
              className="px-8 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-primary/20"
            >
              {isPending ? <FaSpinner className="animate-spin" /> : "Go Live"}
            </button>
          </div>
        </div>
      </div>

      {/* Active Rooms Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Live Now</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{rooms.length} Active Rooms</span>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="py-24 text-center surface-card bg-transparent border-dashed">
            <FaMicrophone className="text-muted-foreground/20 text-6xl mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">The boardroom is currently quiet.</p>
            <p className="text-muted-foreground/60 text-sm font-medium mt-1">Be the first to share your vision.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              let photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.host.name || "?")}&background=050505&color=FFD700`;
              try {
                const photos = JSON.parse(room.host.profile?.photos || "[]");
                if (photos.length > 0) photoUrl = photos[0];
              } catch {}

              const trustScore = room.host.profile?.trustScore || 50;

              return (
                <button
                  key={room.id}
                  onClick={() => router.push(`/boardroom/${room.id}`)}
                  className="surface-card p-6 hover:border-primary/50 transition-all group text-left flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-secondary relative shadow-sm border border-border">
                      <Image
                        src={photoUrl}
                        alt={room.host.name ?? "Host"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                        unoptimized={photoUrl.startsWith("https://ui-avatars")}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-tight">Live Session</span>
                      <span className="text-[9px] font-bold text-primary/60">Trust: {trustScore}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-black text-foreground mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {room.title}
                  </h4>
                  
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest line-clamp-1">{room.host.name}</span>
                    </div>
                    <FaUsers className="text-muted-foreground/30 text-sm" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
