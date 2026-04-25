
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "./actions";
import ChatClient from "./ChatClient";
import Link from "next/link";

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
        <div className="w-24 h-24 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-4xl">💬</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-stone-900 mb-2">Private Messages</h2>
          <p className="text-stone-500 text-sm max-w-xs mx-auto">Sign in to view your conversations and matches.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-stone-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const conversations = await getConversations();

  return <ChatClient initialConversations={conversations} />;
}
