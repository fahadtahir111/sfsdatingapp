"use client";

import { useEffect, useState } from "react";
import { getEvents, rsvpToEvent, getEventAttendees } from "./actions";
import { getProfile } from "../profile/actions";
import { useRealTime } from "@/lib/hooks/useRealTime";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaMapMarkerAlt, FaCrown, FaUserFriends } from "react-icons/fa";
import { useToast } from "@/app/providers/ToastProvider";

interface UserProfileData {
  id: string;
  name: string | null;
  tier?: string;
}

interface AttendeeData {
  id: string;
  name: string | null;
  image: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  image: string;
  isEliteOnly: boolean;
  isRSVPed: boolean;
  rsvpsCount: number;
}

export default function EventsClient({ initialEvents }: { initialEvents: EventData[] }) {
  const { data: events, loading, setData: setEvents } = useRealTime(getEvents, 10000, []);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [attendees, setAttendees] = useState<Record<string, AttendeeData[]>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    getProfile().then(setUserProfile);
  }, []);

  const displayEvents = events || initialEvents;

  useEffect(() => {
    if (displayEvents) {
      displayEvents.forEach(async (evt) => {
        if (!attendees[evt.id]) {
          const res = await getEventAttendees(evt.id);
          setAttendees(prev => ({ ...prev, [evt.id]: res }));
        }
      });
    }
  }, [displayEvents, attendees]);

  const handleRSVP = async (eventId: string) => {
    if (isProcessing) return;
    setIsProcessing(eventId);
    
    const result = await rsvpToEvent(eventId);
    if (!result.success) {
      showToast(result.error || "Failed to update RSVP", "error");
    } else {
      if (displayEvents) {
        setEvents(displayEvents.map(e => {
          if (e.id === eventId) {
            const newRsvpsCount = result.action === "rsvp" ? e.rsvpsCount + 1 : e.rsvpsCount - 1;
            return { ...e, isRSVPed: result.action === "rsvp", rsvpsCount: newRsvpsCount };
          }
          return e;
        }));
      }
    }
    setIsProcessing(null);
  };

  const isElite = userProfile?.tier === "Elite";

  return (
    <div className="min-h-screen bg-background pt-12 px-4 pb-28 relative overflow-hidden">
      {/* Aether Visual Foundation */}
      <div className="aether-mesh absolute inset-0 pointer-events-none opacity-20" />

      <div className="flex justify-between items-end mb-12 px-4 relative z-10">
        <div>
          <h1 className="text-5xl font-heading text-white tracking-tight leading-none">Mixers</h1>
          <p className="sub-heading text-[10px] lowercase text-primary/60 mt-2 tracking-widest">exclusive offline connections within the aether</p>
        </div>
      </div>

      <div className="space-y-10 px-2 relative z-10">
        {displayEvents.length === 0 && !loading && (
          <div className="text-center py-24 bg-white/5 backdrop-blur-xl rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <p className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-700 relative z-10">🗓️</p>
            <h2 className="text-2xl font-heading text-white tracking-tight relative z-10">No mixers scheduled</h2>
            <p className="sub-heading text-[11px] text-white/30 lowercase mt-2 max-w-[280px] mx-auto leading-relaxed relative z-10 tracking-wide">the elite social season is preparing some exclusive galas. check back soon for your invitation.</p>
          </div>
        )}

        {displayEvents.map((evt) => (
          <div key={evt.id} className="bg-white/5 backdrop-blur-2xl rounded-[48px] overflow-hidden shadow-2xl border border-white/10 group transition-all duration-700">
            <div className="relative h-80 w-full overflow-hidden">
              <Image src={evt.image} alt={evt.title} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
              {evt.isEliteOnly && (
                <div className="absolute top-8 left-8 bg-black/80 backdrop-blur-md text-primary sub-heading text-[9px] px-5 py-2.5 rounded-full flex items-center gap-2 border border-primary/20 lowercase tracking-[0.2em] shadow-shadow-glow">
                  <FaCrown className="text-primary" /> elite concierge exclusive
                </div>
              )}
              <div className="absolute bottom-10 left-10 right-10">
                 <h2 className="text-4xl font-heading text-white tracking-tight mb-3 leading-none group-hover:text-primary transition-colors">{evt.title}</h2>
                 <p className="sub-heading text-[11px] text-white/40 lowercase line-clamp-2 max-w-xl leading-relaxed">{evt.description}</p>
              </div>
            </div>
            
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 pb-10 border-b border-white/5">
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                      <FaCalendarAlt className="text-sm" />
                    </div>
                    <div>
                      <p className="sub-heading text-[9px] text-white/20 lowercase tracking-widest mb-1.5 leading-none">date & protocol time</p>
                      <p className="font-heading text-[13px] text-white tracking-tight lowercase">{new Date(evt.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                      <FaMapMarkerAlt className="text-sm" />
                    </div>
                    <div>
                      <p className="sub-heading text-[9px] text-white/20 lowercase tracking-widest mb-1.5 leading-none">elite venue coordinate</p>
                      <p className="font-heading text-[13px] text-white tracking-tight lowercase">{evt.location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end justify-center">
                   <button 
                    onClick={() => handleRSVP(evt.id)}
                    disabled={isProcessing === evt.id}
                    className={`btn-aether w-full md:w-auto px-12 py-5 disabled:opacity-40 sub-heading text-[10px] lowercase ${
                      evt.isRSVPed
                        ? 'bg-white/5 text-white/40 border border-white/10 pointer-events-none'
                        : ''
                    }`}
                  >
                    {evt.isRSVPed ? 'access confirmed' : evt.isEliteOnly ? 'request invitation' : 'book access'}
                  </button>
                  <div className="mt-5 flex items-center gap-2.5">
                     <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-shadow-glow" />
                     <p className="sub-heading text-[9px] text-primary/60 lowercase tracking-[0.2em]">{evt.rsvpsCount} attendees synced</p>
                  </div>
                </div>
              </div>

              {/* Guest List Preview */}
              <div className="bg-white/5 backdrop-blur-md rounded-[36px] p-8 border border-white/5 relative overflow-hidden group/list">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/list:opacity-100 transition-all duration-700" />
                <div className="flex justify-between items-center mb-8 relative z-10">
                   <h3 className="sub-heading text-[10px] text-white/30 lowercase tracking-widest flex items-center gap-2.5">
                     <FaUserFriends className="text-primary" /> guest list intelligence
                   </h3>
                   {!isElite && (
                     <Link href="/store" className="sub-heading text-[9px] text-primary bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20 shadow-shadow-glow hover:bg-primary hover:text-black transition-all lowercase">verify connection</Link>
                   )}
                </div>

                <div className="flex flex-wrap items-center gap-6 relative z-10">
                  {attendees[evt.id]?.length > 0 ? (
                    <>
                      <div className="flex -space-x-5 overflow-hidden">
                        {attendees[evt.id].slice(0, 5).map((att) => (
                          <div key={att.id} className={`relative w-14 h-14 rounded-2xl border-4 border-[#0a0a0a] bg-white/5 overflow-hidden shadow-2xl transition-all duration-500 ${!isElite ? 'blur-[6px] grayscale opacity-50' : 'group-hover:scale-110'}`}>
                            <Image src={att.image} alt="Guest" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                      
                      {isElite ? (
                         <div className="ml-2">
                           <p className="font-heading text-sm text-white tracking-tight">
                             {attendees[evt.id][0].name} {attendees[evt.id].length > 1 && `& ${attendees[evt.id].length - 1} others`}
                           </p>
                           <p className="sub-heading text-[9px] text-primary lowercase tracking-widest mt-1 opacity-80 shadow-shadow-glow">elite connections verified</p>
                         </div>
                      ) : (
                         <div className="ml-2">
                           <p className="sub-heading text-[10px] text-white/40 lowercase tracking-widest">elite members are networking</p>
                           <p className="sub-heading text-[8px] text-white/20 lowercase mt-1">upgrade to signature or elite to view profiles</p>
                         </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-4 opacity-30">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
                       <p className="sub-heading text-[10px] text-white lowercase tracking-widest italic">guest list forming...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
