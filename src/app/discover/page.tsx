export const dynamic = "force-dynamic";

import { fetchDiscoverFeed } from "./actions";
import DiscoverClient from "./DiscoverClient";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function DiscoverPage() {
  const initialCards = await fetchDiscoverFeed({ minAge: 18, maxAge: 50 });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Discover</h1>
          <p className="text-stone-500 font-medium">Meet the most ambitious individuals in your network.</p>
        </div>
        
        <DiscoverClient initialCards={initialCards} />
      </div>
    </DashboardLayout>
  );
}
