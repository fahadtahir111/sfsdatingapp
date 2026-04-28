export const dynamic = 'force-dynamic';

import { getCurrentUser } from "@/lib/auth";
import { fetchDiscoverFeed } from "./actions";
import DiscoverClient from "./DiscoverClient";
import AuthGateCard from "../components/AuthGateCard";

export default async function DiscoverPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthGateCard
        emoji="🔒"
        title="Exclusive Access Only"
        description="Please sign in to explore the SFS Elite network."
      />
    );
  }

  const initialCards = await fetchDiscoverFeed();

  return <DiscoverClient initialCards={initialCards} />;
}
