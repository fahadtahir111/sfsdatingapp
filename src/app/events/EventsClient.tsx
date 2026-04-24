"use client";

import { useEffect, useState } from "react";
import { getEvents, rsvpToEvent, getEventAttendees } from "./actions";
import { getProfile } from "../profile/actions";
import { useRealTime } from "@/lib/hooks/useRealTime";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaMapMarkerAlt, FaCrown, FaUserFriends } from "react-icons/fa";

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
      alert(result.error);
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
    <div className="min-h-screen bg-[#f8f7f5] pt-8 px-4 pb-24">
      <div className="flex justify-between items-end mb-8 px-4 mt-6">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Mixers</h1>
          <p className="text-stone-400 font-medium font-serif italic">Exclusive offline connections.</p>
        </div>
      </div>

      <div className="space-y-8 px-2">
        {displayEvents.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[40px] border border-stone-100 shadow-xl shadow-stone-200/50 p-8">
            <p className="text-5xl mb-6">🗓️</p>
            <h2 className="text-xl font-black text-stone-800">No mixers scheduled</h2>
            <p className="text-stone-400 text-sm font-medium px-10 leading-relaxed">The elite social season is preparing some exclusive Galas. Check back soon for your invite.</p>
          </div>
        )}

        {displayEvents.map((evt) => (
          <div key={evt.id} className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-stone-200/60 border border-stone-100">
            <div className="relative h-72 w-full">
              <Image src={evt.image} alt={evt.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {evt.isEliteOnly && (
                <div className="absolute top-6 left-6 bg-black backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 uppercase tracking-widest shadow-2xl">
                  <FaCrown className="text-amber-400" /> Elite Concierge
                </div>
              )}
              <div className="absolute bottom-8 left-8 right-8 text-white">
                 <h2 className="text-3xl font-black mb-2 tracking-tight">{evt.title}</h2>
                 <p className="text-white/70 text-sm font-medium line-clamp-2 max-w-xl">{evt.description}</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-stone-100">
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-900 shadow-inner">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1.5">Date & Time</p>
                      <p className="font-bold text-stone-900">{new Date(evt.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-900 shadow-inner">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1.5">Elite Venue</p>
                      <p className="font-bold text-stone-900">{evt.location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end justify-center">
                   <button 
                    onClick={() => handleRSVP(evt.id)}
                    disabled={isProcessing === evt.id}
                    className={`w-full md:w-auto px-12 py-5 rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
                      evt.isRSVPed
                        ? 'bg-stone-100 text-stone-500 border border-stone-200'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    {evt.isRSVPed ? 'Managing Access...' : evt.isEliteOnly ? 'Request Invitation' : 'Book Access'}
                  </button>
                  <div className="mt-4 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{evt.rsvpsCount} attendees confirmed</p>
                  </div>
                </div>
              </div>

              {/* Guest List Preview */}
              <div className="bg-[#faf9f6] rounded-[32px] p-6 border border-stone-100/50">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                     <FaUserFriends className="text-stone-900" /> Guest List Intelligence
                   </h3>
                   {!isElite && (
                     <Link href="/premium" className="text-[10px] font-black text-stone-900 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm hover:bg-stone-50 transition-all">Verify Connection</Link>
                   )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {attendees[evt.id]?.length > 0 ? (
                    <>
                      <div className="flex -space-x-4 overflow-hidden">
                        {attendees[evt.id].slice(0, 5).map((att) => (
                          <div key={att.id} className={`relative w-12 h-12 rounded-2xl border-4 border-white bg-stone-100 overflow-hidden shadow-sm ${!isElite ? 'blur-[4px] grayscale' : ''}`}>
                            <Image src={att.image} alt="Guest" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                      
                      {isElite ? (
                         <div className="ml-2">
                           <p className="text-[13px] font-bold text-stone-800">
                             {attendees[evt.id][0].name} {attendees[evt.id].length > 1 && `& ${attendees[evt.id].length - 1} others`}
                           </p>
                           <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Elite Connections Verified</p>
                         </div>
                      ) : (
                         <div className="ml-2">
                           <p className="text-[11px] font-black text-stone-400 uppercase tracking-wide">Elite members are Networking</p>
                           <p className="text-[9px] font-bold text-stone-300 mt-0.5">Upgrade to Signature or Elite to view profiles</p>
                         </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-stone-100 animate-pulse" />
                       <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest italic">Guest list forming...</p>
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
