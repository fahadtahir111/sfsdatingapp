import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "./actions";
import ChatClient from "./ChatClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGateCard from "../components/AuthGateCard";

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthGateCard
        emoji="💬"
        title="Private Messages"
        description="Sign in to view your conversations and elite connections."
      />
    );
  }

  const conversations = await getConversations();

  return (
    <DashboardLayout>
      <div className="space-y-8 h-full flex flex-col">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Messages</h1>
          <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest">Your private connections and networking conversations.</p>
        </div>
        <div className="flex-1 min-h-0 bg-card rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
          <ChatClient initialConversations={conversations} />
        </div>
      </div>
    </DashboardLayout>
  );
}
