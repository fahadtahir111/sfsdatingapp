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

export default function MeetingRoom({ 
  onLeaveCall,
  conversationName 
}: { 
  onLeaveCall?: () => void;
  conversationName?: string;
}) {
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
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050505]">
        <div className="bg-aether-mesh absolute inset-0 opacity-20 pointer-events-none" />
        <LoadingSpinner />
        <p className="text-primary mt-6 font-heading font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Establishing Secure Quantum Channel...
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050505]">
      {/* Aether Background */}
      <div className="bg-aether-mesh absolute inset-0 opacity-30 pointer-events-none" />
      
      {/* Video Content */}
      <div className="relative h-full w-full">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>
      
      {/* Premium Controls Bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-black/40 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 shadow-2xl flex items-center gap-2">
          <CallControls onLeave={onLeaveCall} />
        </div>
      </div>

      {/* Luxury Overlays */}
      <div className="absolute top-10 left-8 flex flex-col z-50">
        <div className="flex items-center gap-3">
          <span className="text-white font-heading font-black text-lg tracking-tighter">
            {conversationName || "Secure Session"}
          </span>
          <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-shadow-glow animate-pulse" />
        </div>
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mt-1">
          Encrypted Session
        </span>
      </div>

      <div className="absolute top-10 right-8 flex items-center gap-3 z-50">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl px-5 py-2.5 shadow-xl transition-all hover:border-primary/30 group">
          <FaVideo className="text-primary text-[10px] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black tracking-widest uppercase text-white/90">
            {participants.length} Active
          </span>
          <div className="w-px h-3 bg-white/10 mx-1" />
          <FaLock className="text-white/40 text-[10px]" />
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-primary/10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-primary/10 pointer-events-none" />
    </div>
  );
}
