"use client";

import {
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LoadingSpinner from "../LoadingSpinner";
import {
  FaLock,
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
  FaPhone,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaEllipsisH,
} from "react-icons/fa";

interface MeetingRoomProps {
  onLeaveCall?: () => void;
  conversationName?: string;
  conversationImage?: string;
}

export default function MeetingRoom({
  onLeaveCall,
  conversationName,
  conversationImage,
}: MeetingRoomProps) {
  const { useCallCallingState, useParticipants, useLocalParticipant } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const call = useCall();

  const [elapsed, setElapsed] = useState(0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Call duration timer
  useEffect(() => {
    if (callingState !== CallingState.JOINED) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callingState]);

  // Auto-hide controls after 4s of inactivity
  const resetHideTimer = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 4000);
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };

  }, [callingState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const toggleMic = async () => {
    try {
      if (micEnabled) {
        await call?.microphone.disable();
      } else {
        await call?.microphone.enable();
      }
      setMicEnabled((v) => !v);
    } catch {}
  };

  const toggleCam = async () => {
    try {
      if (camEnabled) {
        await call?.camera.disable();
      } else {
        await call?.camera.enable();
      }
      setCamEnabled((v) => !v);
    } catch {}
  };

  const handleLeave = async () => {
    try {
      await call?.leave();
    } catch {}
    onLeaveCall?.();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="bg-aether-mesh absolute inset-0 opacity-30 pointer-events-none" />

        {/* Decorative rings */}
        <div className="absolute w-64 h-64 rounded-full border border-primary/10 animate-ping opacity-20" />
        <div
          className="absolute w-48 h-48 rounded-full border border-primary/15 animate-ping opacity-30"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-32 h-32 rounded-full border border-primary/20 animate-ping opacity-40"
          style={{ animationDelay: "1s" }}
        />

        {/* Avatar */}
        <div className="relative w-24 h-24 rounded-[28px] overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_rgba(196,255,0,0.2)] mb-8">
          {conversationImage ? (
            <Image
              src={conversationImage}
              alt={conversationName || "Contact"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="text-4xl font-heading text-primary">
                {(conversationName || "?")[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <LoadingSpinner />
        <p className="text-primary mt-6 font-heading font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          Establishing Secure Channel…
        </p>
        <p className="text-white/20 mt-2 text-[9px] uppercase tracking-widest font-bold">
          End-to-end encrypted
        </p>
      </div>
    );
  }

  // ── Active call ──────────────────────────────────────────────────────────
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#050505] select-none"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Aether background */}
      <div className="bg-aether-mesh absolute inset-0 opacity-20 pointer-events-none z-0" />

      {/* ── Stream Video Feed ── */}
      <div className="absolute inset-0 z-10">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>

      {/* ── Top HUD ── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            key="top-hud"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 right-0 z-50 px-4 pt-safe"
          >
            {/* Glass bar */}
            <div className="flex items-center justify-between px-4 py-3 mt-2 rounded-2xl bg-black/50 backdrop-blur-3xl border border-white/10 shadow-2xl mx-2">
              {/* Left: Caller info */}
              <div className="flex items-center gap-3">
                {/* Avatar thumbnail */}
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                  {conversationImage ? (
                    <Image
                      src={conversationImage}
                      alt={conversationName || "Contact"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-sm font-heading text-primary font-black">
                        {(conversationName || "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Live pulse */}
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(196,255,0,0.8)] animate-pulse border border-black" />
                </div>

                <div>
                  <h2 className="text-sm font-heading font-black text-white tracking-tight leading-none">
                    {conversationName || "Secure Session"}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 mt-0.5">
                    Encrypted Session
                  </p>
                </div>
              </div>

              {/* Center: Timer */}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(196,255,0,0.8)]" />
                <span className="text-primary font-mono text-[11px] font-black tracking-widest">
                  {formatTime(elapsed)}
                </span>
              </div>

              {/* Right: Participants + lock */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <FaVideo className="text-primary text-[9px]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    {participants.length} Active
                  </span>
                  <div className="w-px h-3 bg-white/10" />
                  <FaLock className="text-white/30 text-[9px]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right side panel toggle ── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            key="side-panel-toggle"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
          >
            {/* Fullscreen */}
            <button
              type="button"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={toggleFullscreen}
              className="w-11 h-11 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/30 transition-all active:scale-95 shadow-xl"
            >
              {isFullscreen ? (
                <FaCompress className="text-sm" />
              ) : (
                <FaExpand className="text-sm" />
              )}
            </button>

            {/* More options */}
            <button
              type="button"
              aria-label="More options"
              onClick={() => setShowSidePanel((v) => !v)}
              className={`w-11 h-11 rounded-2xl backdrop-blur-2xl border flex items-center justify-center transition-all active:scale-95 shadow-xl ${
                showSidePanel
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-black/50 border-white/10 text-white/60 hover:text-primary hover:border-primary/30"
              }`}
            >
              <FaEllipsisH className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Side info panel ── */}
      <AnimatePresence>
        {showSidePanel && (
          <motion.div
            key="side-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 bottom-0 w-64 z-50 bg-black/80 backdrop-blur-3xl border-l border-white/10 flex flex-col p-6 gap-6"
          >
            <div className="mt-16">
              <h3 className="sub-heading text-white/40 mb-4">Participants</h3>
              <div className="flex flex-col gap-3">
                {participants.map((p) => (
                  <div
                    key={p.sessionId}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                      {(p.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {p.name || "User"}
                      </p>
                      <p className="text-[9px] text-white/30 uppercase tracking-wider font-bold">
                        {p.sessionId === localParticipant?.sessionId
                          ? "You"
                          : "Connected"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {p.audioStream ? (
                        <FaMicrophone className="text-primary text-[9px]" />
                      ) : (
                        <FaMicrophoneSlash className="text-white/20 text-[9px]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <FaLock className="text-primary text-[9px]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                    End-to-End Encrypted
                  </span>
                </div>
                <p className="text-[9px] text-white/30 leading-relaxed">
                  This call is secured with quantum-grade encryption. No one
                  else can listen.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Controls ── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            key="bottom-controls"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-safe"
          >
            {/* Gradient fade */}
            <div className="w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none absolute bottom-0" />

            {/* Control bar */}
            <div className="relative flex items-center gap-3 mb-8 px-6 py-4 rounded-[3rem] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl">

              {/* Speaker toggle */}
              <ControlButton
                label={speakerEnabled ? "Mute speaker" : "Unmute speaker"}
                onClick={() => setSpeakerEnabled((v) => !v)}
                active={speakerEnabled}
                activeColor="primary"
              >
                {speakerEnabled ? (
                  <FaVolumeUp className="text-base" />
                ) : (
                  <FaVolumeMute className="text-base" />
                )}
              </ControlButton>

              {/* Microphone toggle */}
              <ControlButton
                label={micEnabled ? "Mute mic" : "Unmute mic"}
                onClick={toggleMic}
                active={micEnabled}
                activeColor="primary"
              >
                {micEnabled ? (
                  <FaMicrophone className="text-base" />
                ) : (
                  <FaMicrophoneSlash className="text-base" />
                )}
              </ControlButton>

              {/* End call — center, largest */}
              <button
                type="button"
                aria-label="End call"
                onClick={handleLeave}
                className="w-16 h-16 rounded-2xl bg-red-500 text-white flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:bg-red-600 active:scale-95 transition-all border border-red-400/30 mx-2"
              >
                <FaPhone className="rotate-[135deg]" />
              </button>

              {/* Camera toggle */}
              <ControlButton
                label={camEnabled ? "Disable camera" : "Enable camera"}
                onClick={toggleCam}
                active={camEnabled}
                activeColor="primary"
              >
                {camEnabled ? (
                  <FaVideo className="text-base" />
                ) : (
                  <FaVideoSlash className="text-base" />
                )}
              </ControlButton>

              {/* Placeholder for symmetry */}
              <ControlButton
                label="More"
                onClick={() => setShowSidePanel((v) => !v)}
                active={showSidePanel}
                activeColor="primary"
              >
                <FaEllipsisH className="text-base" />
              </ControlButton>
            </div>

            {/* Mic state hint */}
            <AnimatePresence>
              {!micEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-xl"
                >
                  <FaMicrophoneSlash className="text-red-400 text-xs" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                    Microphone Muted
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Decorative corners ── */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/20 pointer-events-none z-20 rounded-br-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/20 pointer-events-none z-20" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-white/5 pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-white/5 pointer-events-none z-20" />
    </div>
  );
}

// ─── Reusable Control Button ────────────────────────────────────────────────
function ControlButton({
  label,
  onClick,
  active,
  activeColor,
  children,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  activeColor?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const activeClass =
    activeColor === "primary"
      ? "bg-primary/15 text-primary border-primary/30 shadow-[0_0_15px_rgba(196,255,0,0.15)]"
      : "bg-secondary/15 text-secondary border-secondary/30";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 border ${
        active
          ? activeClass
          : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}
