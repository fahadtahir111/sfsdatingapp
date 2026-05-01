import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin";
import { deletePostCommentAdmin, deleteReelCommentAdmin, toggleUserSuspension } from "./actions";

type DashboardFilters = {
  q: string;
  txType: string;
};

async function getDashboardData(filters: DashboardFilters) {
  const now = new Date();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const hasQuery = filters.q.trim().length > 0;

  const [
    totalUsers,
    usersLast7d,
    totalProfiles,
    totalPosts,
    totalReels,
    totalStories,
    totalMessages,
    totalConversations,
    totalFriendRequests,
    pendingFriendRequests,
    totalSubscriptions,
    eliteSubscriptions,
    recentUsers,
    usersMatchingQuery,
    recentPosts,
    recentReels,
    recentRoseTransactions,
    moderationPostComments,
    moderationReelComments,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last7d } } }),
    prisma.profile.count(),
    prisma.post.count(),
    prisma.reel.count(),
    prisma.story.count(),
    prisma.message.count(),
    prisma.conversation.count(),
    prisma.friendRequest.count(),
    prisma.friendRequest.count({ where: { status: "PENDING" } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { tier: "Elite" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, createdAt: true, roseBalance: true, isSuspended: true },
    }),
    prisma.user.findMany({
      where: hasQuery
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" } },
              { email: { contains: filters.q, mode: "insensitive" } },
              { id: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: hasQuery ? 30 : 0,
      select: { id: true, name: true, email: true, createdAt: true, roseBalance: true, isSuspended: true },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, content: true, createdAt: true, user: { select: { name: true, email: true } } },
    }),
    prisma.reel.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, caption: true, createdAt: true, user: { select: { name: true, email: true } } },
    }),
    prisma.roseTransaction.findMany({
      where: filters.txType ? { type: filters.txType } : undefined,
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        amount: true,
        type: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.postComment.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        postId: true,
      },
    }),
    prisma.reelComment.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        reelId: true,
      },
    }),
    prisma.verification.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      usersLast7d,
      totalProfiles,
      totalPosts,
      totalReels,
      totalStories,
      totalMessages,
      totalConversations,
      totalFriendRequests,
      pendingFriendRequests,
      totalSubscriptions,
      eliteSubscriptions,
    },
    recentUsers,
    usersMatchingQuery,
    recentPosts,
    recentReels,
    recentRoseTransactions,
    moderationPostComments,
    moderationReelComments,
    pendingVerifications,
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; txType?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?callbackUrl=/admin");

  const adminUser = await getAdminUser();
  if (!adminUser) redirect("/feed");
  const adminRole = adminUser.adminRole;
  const canModerate = adminRole === "moderator" || adminRole === "superadmin";
  const canSuspend = adminRole === "superadmin";

  const resolvedSearch = searchParams ? await searchParams : {};
  const filters: DashboardFilters = {
    q: resolvedSearch?.q || "",
    txType: resolvedSearch?.txType || "",
  };
  const data = await getDashboardData(filters);

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Admin Control Center</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900">Website Monitoring Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-stone-500">
            Logged in as {adminUser.email}. Add admin emails in <code>ADMIN_EMAILS</code>.
          </p>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-stone-400">
            Role: {adminRole}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">Support: view dashboard</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Moderator: manage comments</span>
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Superadmin: user suspension + exports</span>
          </div>
          <form className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search users by name/email/id"
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            />
            <input
              name="txType"
              defaultValue={filters.txType}
              placeholder="Rose tx type filter (e.g. DAILY_BONUS)"
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            />
            <button className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-black text-white">Apply Filters</button>
          </form>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Users", value: data.stats.totalUsers },
            { label: "New Users (7d)", value: data.stats.usersLast7d },
            { label: "Profiles", value: data.stats.totalProfiles },
            { label: "Messages", value: data.stats.totalMessages },
            { label: "Posts", value: data.stats.totalPosts },
            { label: "Reels", value: data.stats.totalReels },
            { label: "Stories", value: data.stats.totalStories },
            { label: "Conversations", value: data.stats.totalConversations },
            { label: "Friend Requests", value: data.stats.totalFriendRequests },
            { label: "Pending Requests", value: data.stats.pendingFriendRequests },
            { label: "Subscriptions", value: data.stats.totalSubscriptions },
            { label: "Elite Subs", value: data.stats.eliteSubscriptions },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-stone-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">Recent Users</h2>
            <div className="mt-4 space-y-3">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="rounded-xl border border-stone-100 p-3">
                  <p className="text-sm font-black text-stone-900">{u.name || "Unnamed User"}</p>
                  <p className="text-xs text-stone-500">{u.email}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Roses: {u.roseBalance} • Joined {new Date(u.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">Recent Posts</h2>
            <div className="mt-4 space-y-3">
              {data.recentPosts.map((p) => (
                <div key={p.id} className="rounded-xl border border-stone-100 p-3">
                  <p className="text-xs font-black text-stone-900">{p.user.name || p.user.email || "Unknown"}</p>
                  <p className="mt-1 text-sm text-stone-700">{(p.content || "(media-only post)").slice(0, 120)}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">Recent Reels</h2>
            <div className="mt-4 space-y-3">
              {data.recentReels.map((r) => (
                <div key={r.id} className="rounded-xl border border-stone-100 p-3">
                  <p className="text-xs font-black text-stone-900">{r.user.name || r.user.email || "Unknown"}</p>
                  <p className="mt-1 text-sm text-stone-700">{(r.caption || "(no caption)").slice(0, 120)}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">User Control</h2>
            <div className="mt-4 space-y-3">
              {(filters.q ? data.usersMatchingQuery : data.recentUsers).map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl border border-stone-100 p-3">
                  <div>
                    <p className="text-sm font-black text-stone-900">{u.name || "Unnamed User"}</p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {u.isSuspended ? "Suspended" : "Active"} • Roses {u.roseBalance}
                    </p>
                  </div>
                  {canSuspend ? (
                    <form action={toggleUserSuspension}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="nextState" value={u.isSuspended ? "false" : "true"} />
                      <button
                        className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wider ${
                          u.isSuspended ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-lg bg-stone-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                      No suspend access
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">Roses Ledger</h2>
            {adminRole === "superadmin" && (
              <div className="mt-2 flex gap-2">
                <a href="/api/admin/export/users" className="rounded-lg bg-stone-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                  Export Users CSV
                </a>
                <a href="/api/admin/export/roses" className="rounded-lg bg-stone-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                  Export Roses CSV
                </a>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {data.recentRoseTransactions.map((tx) => (
                <div key={tx.id} className="rounded-xl border border-stone-100 p-3">
                  <p className="text-sm font-black text-stone-900">{tx.user.name || tx.user.email || tx.user.id}</p>
                  <p className="text-xs text-stone-500">{tx.type}</p>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount} roses • {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">Pending Verifications</h2>
            <div className="mt-4 space-y-3">
              {data.pendingVerifications.length === 0 ? (
                <p className="text-xs text-stone-500">No pending verification requests.</p>
              ) : (
                data.pendingVerifications.map((v) => (
                  <div key={v.id} className="rounded-xl border border-stone-100 p-3">
                    <p className="text-sm font-black text-stone-900">{v.user.name || v.user.email || v.user.id}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {new Date(v.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">Moderation Queue (Post Comments)</h2>
            <div className="mt-4 space-y-3">
              {data.moderationPostComments.map((c) => (
                <div key={c.id} className="rounded-xl border border-stone-100 p-3">
                  <p className="text-xs font-black text-stone-900">{c.user.name || c.user.email || c.user.id}</p>
                  <p className="mt-1 text-sm text-stone-700">{c.text.slice(0, 160)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Post {c.postId.slice(0, 10)} • {new Date(c.createdAt).toLocaleString()}
                  </p>
                  {canModerate && (
                    <form action={deletePostCommentAdmin} className="mt-2">
                      <input type="hidden" name="commentId" value={c.id} />
                      <button className="rounded-lg bg-red-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-700">
                        Delete Comment
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-500">Moderation Queue (Reel Comments)</h2>
            <div className="mt-4 space-y-3">
              {data.moderationReelComments.map((c) => (
                <div key={c.id} className="rounded-xl border border-stone-100 p-3">
                  <p className="text-xs font-black text-stone-900">{c.user.name || c.user.email || c.user.id}</p>
                  <p className="mt-1 text-sm text-stone-700">{c.text.slice(0, 160)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Reel {c.reelId.slice(0, 10)} • {new Date(c.createdAt).toLocaleString()}
                  </p>
                  {canModerate && (
                    <form action={deleteReelCommentAdmin} className="mt-2">
                      <input type="hidden" name="commentId" value={c.id} />
                      <button className="rounded-lg bg-red-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-700">
                        Delete Comment
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

