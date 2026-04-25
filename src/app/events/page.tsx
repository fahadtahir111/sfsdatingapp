
import { getCurrentUser } from "@/lib/auth";
import { getEvents } from "./actions";
import EventsClient from "./EventsClient";
import Link from "next/link";
import { FaCalendarAlt } from "react-icons/fa";

export default async function EventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7f5] gap-8 p-8">
        <FaCalendarAlt className="text-6xl text-stone-200 animate-pulse" />
        <div className="text-center">
          <h2 className="text-3xl font-black text-stone-900 mb-2">Member Mixers</h2>
          <p className="text-stone-500 text-sm max-w-xs mx-auto">Sign in to view and RSVP to exclusive offline events and galas.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-stone-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const events = await getEvents();

  return <EventsClient initialEvents={events} />;
}
