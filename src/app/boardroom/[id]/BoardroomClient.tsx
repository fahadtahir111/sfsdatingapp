/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  useStreamVideoClient, 
  Call, 
  StreamCall, 
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaUsers, FaCrown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Image from "next/image";

export default function BoardroomClient({ boardroom }: { boardroom: any }) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!client) return;

    const myCall = client.call("default", boardroom.id);
    myCall.join({ create: true }).then(() => {
      setCall(myCall);
    });

    return () => {
      myCall.leave();
    };
  }, [client, boardroom.id]);

  if (!call) return <LoadingSpinner />;

  return (
    <StreamCall call={call}>
      <BoardroomUI boardroom={boardroom} />
    </StreamCall>
  );
}

function BoardroomUI({ boardroom }: { boardroom: any }) {
  const { useParticipants, useCallCallingState, useMicrophoneState } = useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();
  const { isMute, microphone } = useMicrophoneState();
  const router = useRouter();

  if (callingState !== CallingState.JOINED) {
    return <LoadingSpinner />;
  }

  const hostParticipant = participants.find(p => p.userId === boardroom.hostId);
  const otherParticipants = participants.filter(p => p.userId !== boardroom.hostId);

  return (
    <div className="flex flex-col h-screen bg-stone-950 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-yellow-400 uppercase">The Boardroom</h1>
          <p className="text-stone-500 text-xs font-bold tracking-widest">{boardroom.title}</p>
        </div>
        <button 
          type="button"
          aria-label="Leave boardroom"
          onClick={() => router.push("/boardroom")}
          className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-12">
          <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 animate-pulse shadow-2xl shadow-yellow-400/20">
            <div className="w-full h-full rounded-[2.8rem] bg-stone-900 flex items-center justify-center overflow-hidden">
              {hostParticipant?.image ? (
                <Image
                  src={hostParticipant.image}
                  alt={hostParticipant.name ?? "Host"}
                  fill
                  sizes="192px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="text-5xl font-black">{hostParticipant?.name?.charAt(0)}</span>
              )}
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-stone-900 border border-yellow-400/50 px-4 py-1 rounded-full flex items-center gap-2 shadow-xl">
            <FaCrown className="text-yellow-400 text-xs" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Host</span>
          </div>
        </div>
        
        <h2 className="text-xl font-black mb-2">{boardroom.host.name}</h2>
        <p className="text-stone-500 text-sm font-medium mb-12 text-center max-w-xs">
          {boardroom.description || "Live discussion in progress."}
        </p>

        {/* Listeners Grid */}
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-4 text-stone-500">
            <FaUsers />
            <span className="text-xs font-black uppercase tracking-widest">Listeners ({otherParticipants.length})</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {otherParticipants.map(p => (
              <div key={p.sessionId} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-white/5 overflow-hidden flex items-center justify-center relative">
                   {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name ?? "Participant"}
                      fill
                      sizes="56px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg font-black">{p.name?.charAt(0)}</span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-stone-400 truncate w-full text-center">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-auto flex justify-center gap-6 pb-8">
        <button 
          type="button"
          aria-label={isMute ? "Unmute microphone" : "Mute microphone"}
          onClick={() => microphone.toggle()}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-all shadow-2xl ${
            isMute ? "bg-stone-800 text-stone-400" : "bg-yellow-400 text-stone-900 scale-110"
          }`}
        >
          {isMute ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
      </div>
    </div>
  );
}
