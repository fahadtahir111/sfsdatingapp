
import { getCurrentUser } from "@/lib/auth";
import { getEvents } from "./actions";
import EventsClient from "./EventsClient";
import AuthGateCard from "../components/AuthGateCard";

export default async function EventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthGateCard
        emoji="🗓️"
        title="Member Mixers"
        description="Sign in to view and RSVP to exclusive offline events and galas."
      />
    );
  }

  const events = await getEvents();

  return <EventsClient initialEvents={events} />;
}
