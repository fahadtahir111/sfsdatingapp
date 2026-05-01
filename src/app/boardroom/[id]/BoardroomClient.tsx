"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useStreamVideoClient,
  Call,
  StreamCall,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaUsers,
  FaCrown,
  FaSpinner,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { endBoardroom } from "../actions";

type BoardroomData = {
  id: string;
  title: string;
  description: string | null;
  hostId: string;
  host: { name: string | null };
};

export default function BoardroomClient({
  boardroom,
}: {
  boardroom: BoardroomData;
}) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);
  const [joining, setJoining] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!client) {
      // No Stream client means it's not configured — still allow a graceful UI
      setJoining(false);
      setJoinError("Stream Video is not configured. Audio rooms are unavailable.");
      return;
    }

    let active = true;
    let myCall: Call | null = null;

    const join = async () => {
      try {
        // Use "default" call type for maximum compatibility
        myCall = client.call("default", boardroom.id);
        await myCall.join({ create: true });
        // Ensure camera is disabled for audio rooms
        await myCall.camera.disable();
        if (active) setCall(myCall);
      } catch (err) {
        console.error("Failed to join boardroom:", err);
        if (active)
          setJoinError("Could not connect to the boardroom. Please try again.");
      } finally {
        if (active) setJoining(false);
      }
    };

    join();

    return () => {
      active = false;
      myCall?.leave().catch(() => {});
    };
  }, [client, boardroom.id]);

  const handleLeave = useCallback(async () => {
    try {
      await call?.leave();
    } catch {}
    router.push("/boardroom");
  }, [call, router]);

  const handleEnd = useCallback(async () => {
    try {
      await call?.leave();
      await endBoardroom(boardroom.id);
    } catch {}
    router.push("/boardroom");
  }, [call, boardroom.id, router]);

  // — Loading state —
  if (joining) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-stone-950 gap-4">
        <FaSpinner className="text-yellow-400 text-3xl animate-spin" />
        <p className="text-stone-400 text-xs font-black uppercase tracking-[0.25em]">
          Entering Boardroom…
        </p>
      </div>
    );
  }

  // — Error state —
  if (joinError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-stone-950 gap-6 px-6 text-center">
        <p className="text-stone-400 text-sm font-semibold max-w-xs">{joinError}</p>
        <button
          onClick={() => router.push("/boardroom")}
          className="px-6 py-3 bg-yellow-400 text-stone-900 rounded-xl font-black text-sm uppercase tracking-widest"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!call) return null;

  return (
    <StreamCall call={call}>
      <BoardroomUI boardroom={boardroom} onLeave={handleLeave} onEnd={handleEnd} />
    </StreamCall>
  );
}

// ─── Inner UI — reads live call state via hooks ────────────────────────────
function BoardroomUI({
  boardroom,
  onLeave,
  onEnd,
}: {
  boardroom: BoardroomData;
  onLeave: () => void;
  onEnd: () => void;
}) {
  const { useParticipants, useCallCallingState, useMicrophoneState, useLocalParticipant } =
    useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();
  const { isMute, microphone } = useMicrophoneState();
  const localParticipant = useLocalParticipant();

  const isHost = localParticipant?.userId === boardroom.hostId;
  const hostParticipant = participants.find((p) => p.userId === boardroom.hostId);
  const others = participants.filter((p) => p.userId !== boardroom.hostId);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-stone-950 gap-3">
        <FaSpinner className="text-yellow-400 text-3xl animate-spin" />
        <p className="text-stone-400 text-xs font-black uppercase tracking-widest">
          Syncing…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-950 text-white">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-safe pt-5 pb-4 border-b border-white/5">
        <div>
          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.25em] mb-0.5">
            The Boardroom
          </p>
          <h1 className="text-base font-black text-white line-clamp-1">
            {boardroom.title}
          </h1>
        </div>
        <button
          type="button"
          aria-label="Leave boardroom"
          onClick={onLeave}
          className="w-11 h-11 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* ── Stage — Host ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {/* Host avatar */}
        <div className="relative">
          <div
            className={`w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-yellow-400 to-yellow-600 p-[3px] ${
              hostParticipant?.isSpeaking
                ? "shadow-2xl shadow-yellow-400/30 ring-4 ring-yellow-400/30"
                : "shadow-xl"
            } transition-all`}
          >
            <div className="w-full h-full rounded-[2.3rem] bg-stone-900 overflow-hidden relative flex items-center justify-center">
              {hostParticipant?.image ? (
                <Image
                  src={hostParticipant.image}
                  alt={hostParticipant.name ?? "Host"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-4xl font-black text-white">
                  {boardroom.host.name?.charAt(0) ?? "?"}
                </span>
              )}
            </div>
          </div>
          {/* Host badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-stone-900 border border-yellow-400/50 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-xl whitespace-nowrap">
            <FaCrown className="text-yellow-400 text-[9px]" />
            <span className="text-[9px] font-black uppercase tracking-tight text-yellow-400">
              Host
            </span>
          </div>
        </div>

        <div className="text-center mt-4">
          <h2 className="text-xl font-black text-white">
            {boardroom.host.name ?? "Host"}
          </h2>
          <p className="text-stone-500 text-xs mt-1 font-medium max-w-xs mx-auto">
            {boardroom.description ?? "Live audio discussion in progress."}
          </p>
        </div>

        {/* ── Listeners grid ── */}
        {others.length > 0 && (
          <div className="w-full max-w-sm mt-2">
            <div className="flex items-center gap-2 mb-3 text-stone-500">
              <FaUsers className="text-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Listeners ({others.length})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {others.slice(0, 12).map((p) => (
                <div key={p.sessionId} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-stone-800 border overflow-hidden relative flex items-center justify-center transition-all ${
                      p.isSpeaking ? "border-yellow-400/40 shadow-lg shadow-yellow-400/10" : "border-white/5"
                    }`}
                  >
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name ?? "Listener"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-base font-black text-stone-400">
                        {p.name?.charAt(0) ?? "?"}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-stone-500 truncate w-full text-center">
                    {p.name?.split(" ")[0] ?? "User"}
                  </span>
                </div>
              ))}
              {others.length > 12 && (
                <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-white/5 flex items-center justify-center">
                  <span className="text-[9px] font-black text-stone-400">
                    +{others.length - 12}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-center gap-5 px-6 py-6 pb-safe border-t border-white/5 bg-stone-950">
        {/* Mute toggle */}
        <button
          type="button"
          aria-label={isMute ? "Unmute" : "Mute"}
          onClick={() => microphone.toggle()}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-all shadow-lg active:scale-90 ${
            isMute
              ? "bg-stone-800 text-stone-400"
              : "bg-yellow-400 text-stone-900 shadow-yellow-400/20"
          }`}
        >
          {isMute ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>

        {/* Leave */}
        <button
          type="button"
          aria-label="Leave call"
          onClick={onLeave}
          className="w-14 h-14 rounded-3xl bg-red-500/15 text-red-400 flex items-center justify-center text-xl transition-all hover:bg-red-500 hover:text-white active:scale-90"
        >
          <FaPhoneSlash />
        </button>

        {/* End session (host only) */}
        {isHost && (
          <button
            type="button"
            aria-label="End session for all"
            onClick={onEnd}
            className="px-5 h-14 rounded-3xl bg-red-600 text-white flex items-center justify-center text-xs font-black uppercase tracking-widest gap-2 transition-all hover:bg-red-500 active:scale-95"
          >
            End Session
          </button>
        )}
      </div>
    </div>
  );
}
