"use client";

import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useEffect } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { FaLock, FaVideo } from "react-icons/fa";

export default function MeetingRoom({ onLeaveCall }: { onLeaveCall?: () => void }) {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();

  useEffect(() => {
    if (callingState === CallingState.LEFT && onLeaveCall) {
      onLeaveCall();
    }
  }, [callingState, onLeaveCall]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-950">
        <LoadingSpinner />
        <p className="text-white ml-3 font-black uppercase tracking-widest text-xs">Connecting to Secure Line...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-stone-950">
      <SpeakerLayout participantsBarPosition="bottom" />
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 shadow-2xl">
          <CallControls onLeave={() => {
            if (onLeaveCall) onLeaveCall();
          }} />
        </div>
      </div>

      {/* Luxury Overlays */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Encrypted Session</span>
      </div>
      <div className="absolute top-8 right-8 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-white/80">
        <FaVideo className="text-[10px]" />
        <span className="text-[10px] font-black tracking-widest uppercase">{participants.length} in call</span>
        <FaLock className="text-[10px]" />
      </div>
    </div>
  );
}
