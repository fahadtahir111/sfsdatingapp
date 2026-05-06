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
      <div className="surface-card p-10 bg-aether-mesh relative overflow-hidden group border-primary/20">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform">
          <FaMicrophone className="text-[12rem] text-primary" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-heading mb-4 tracking-tight">Host a Session</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed font-medium">
            Share insights, pitch ideas, or network with the most ambitious members of the network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Room Title (e.g. Scaling to $10M ARR)"
              className="flex-1 bg-white/5 border border-border rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-stone-600 text-foreground"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={isPending || !title.trim()}
              className="btn-aether py-4 px-8 min-w-[120px]"
            >
              {isPending ? <FaSpinner className="animate-spin mx-auto" /> : "Go Live"}
            </button>
          </div>
        </div>
      </div>

      {/* Active Rooms Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="sub-heading">Live Now</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-shadow-glow" />
            <span className="sub-heading text-primary lowercase">{rooms.length} Active Rooms</span>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="py-24 text-center surface-card bg-transparent border-dashed">
            <FaMicrophone className="text-muted-foreground/20 text-6xl mx-auto mb-4" />
            <p className="sub-heading">The boardroom is quiet.</p>
            <p className="text-muted-foreground/60 text-sm font-medium mt-1">Be the first to share your vision.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              let photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.host.name || "?")}&background=050505&color=c4ff00`;
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
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted relative shadow-sm border border-border">
                      <Image
                        src={photoUrl}
                        alt={room.host.name ?? "Host"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                        unoptimized={photoUrl.startsWith("https://ui-avatars")}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-tight">Live Session</span>
                      <span className="text-[9px] font-bold text-cobalt">Trust: {trustScore}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-heading text-foreground mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {room.title}
                  </h4>
                  
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-shadow-glow" />
                      <span className="sub-heading text-[10px] text-muted-foreground lowercase line-clamp-1">{room.host.name}</span>
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
