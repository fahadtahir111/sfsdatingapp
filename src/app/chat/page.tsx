
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "./actions";
import ChatClient from "./ChatClient";
import AuthGateCard from "../components/AuthGateCard";

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthGateCard
        emoji="💬"
        title="Private Messages"
        description="Sign in to view your conversations and matches."
      />
    );
  }

  const conversations = await getConversations();

  return <ChatClient initialConversations={conversations} />;
}
