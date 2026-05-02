import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin";
import { deletePostCommentAdmin, deleteReelCommentAdmin, toggleUserSuspension } from "./actions";

type DashboardFilters = { q: string; txType: string };

async function getDashboardData(filters: DashboardFilters) {
  const now = new Date();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const hasQuery = filters.q.trim().length > 0;

  const [
    totalUsers, usersLast7d, totalProfiles, totalPosts, totalReels, totalStories,
    totalMessages, totalConversations, totalFriendRequests, pendingFriendRequests,
    totalSubscriptions, eliteSubscriptions, recentUsers, usersMatchingQuery,
    recentPosts, recentReels, recentRoseTransactions, moderationPostComments,
    moderationReelComments, pendingVerifications,
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
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, name: true, email: true, createdAt: true, roseBalance: true, isSuspended: true } }),
    prisma.user.findMany({
      where: hasQuery ? { OR: [{ name: { contains: filters.q, mode: "insensitive" } }, { email: { contains: filters.q, mode: "insensitive" } }] } : undefined,
      orderBy: { createdAt: "desc" }, take: hasQuery ? 30 : 0,
      select: { id: true, name: true, email: true, createdAt: true, roseBalance: true, isSuspended: true },
    }),
    prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, content: true, createdAt: true, user: { select: { name: true, email: true } } } }),
    prisma.reel.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, caption: true, createdAt: true, user: { select: { name: true, email: true } } } }),
    prisma.roseTransaction.findMany({ where: filters.txType ? { type: filters.txType } : undefined, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, amount: true, type: true, createdAt: true, user: { select: { id: true, name: true, email: true } } } }),
    prisma.postComment.findMany({ orderBy: { createdAt: "desc" }, take: 15, select: { id: true, text: true, createdAt: true, user: { select: { id: true, name: true, email: true } }, postId: true } }),
    prisma.reelComment.findMany({ orderBy: { createdAt: "desc" }, take: 15, select: { id: true, text: true, createdAt: true, user: { select: { id: true, name: true, email: true } }, reelId: true } }),
    prisma.verification.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 15, select: { id: true, createdAt: true, user: { select: { id: true, name: true, email: true } } } }),
  ]);

  return { stats: { totalUsers, usersLast7d, totalProfiles, totalPosts, totalReels, totalStories, totalMessages, totalConversations, totalFriendRequests, pendingFriendRequests, totalSubscriptions, eliteSubscriptions }, recentUsers, usersMatchingQuery, recentPosts, recentReels, recentRoseTransactions, moderationPostComments, moderationReelComments, pendingVerifications };
}

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ q?: string; txType?: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/auth/login?callbackUrl=/admin");

  const adminUser = await getAdminUser();
  if (!adminUser) redirect("/feed");

  const adminRole = adminUser.adminRole;
  const canModerate = adminRole === "moderator" || adminRole === "superadmin";
  const canSuspend = adminRole === "superadmin";

  const resolvedSearch = searchParams ? await searchParams : {};
  const filters: DashboardFilters = { q: resolvedSearch?.q || "", txType: resolvedSearch?.txType || "" };
  const data = await getDashboardData(filters);

  const StatCard = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-black ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Admin Control Center</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">SFS Elite Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Logged in as <span className="text-foreground font-black">{adminUser.email}</span> · Role: <span className="text-primary font-black uppercase">{adminRole}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary border border-border px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support: view</span>
            <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">Moderator: comments</span>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">Superadmin: full control</span>
          </div>
          <form className="mt-5 flex flex-wrap gap-3">
            <input name="q" defaultValue={filters.q} placeholder="Search users by name / email" className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none flex-1 min-w-48" />
            <input name="txType" defaultValue={filters.txType} placeholder="Rose tx type (e.g. PURCHASE)" className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none flex-1 min-w-48" />
            <button className="rounded-xl bg-primary text-black px-6 py-2.5 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">Apply</button>
          </form>
        </header>

        {/* Stats Grid */}
        <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Users" value={data.stats.totalUsers} />
          <StatCard label="New (7d)" value={data.stats.usersLast7d} highlight />
          <StatCard label="Profiles" value={data.stats.totalProfiles} />
          <StatCard label="Posts" value={data.stats.totalPosts} />
          <StatCard label="Reels" value={data.stats.totalReels} />
          <StatCard label="Stories" value={data.stats.totalStories} />
          <StatCard label="Messages" value={data.stats.totalMessages} />
          <StatCard label="Conversations" value={data.stats.totalConversations} />
          <StatCard label="Friend Requests" value={data.stats.totalFriendRequests} />
          <StatCard label="Pending Requests" value={data.stats.pendingFriendRequests} highlight />
          <StatCard label="Subscriptions" value={data.stats.totalSubscriptions} />
          <StatCard label="Elite Subs" value={data.stats.eliteSubscriptions} highlight />
        </section>

        {/* Content Rows */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Recent Users */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Users</h2>
            <div className="space-y-3">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="rounded-xl border border-border bg-secondary p-3">
                  <p className="text-sm font-black text-foreground">{u.name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                    🌹 {u.roseBalance} · {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Posts</h2>
            <div className="space-y-3">
              {data.recentPosts.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-secondary p-3">
                  <p className="text-xs font-black text-foreground">{p.user.name || p.user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{(p.content || "(media post)").slice(0, 100)}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reels */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Reels</h2>
            <div className="space-y-3">
              {data.recentReels.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-secondary p-3">
                  <p className="text-xs font-black text-foreground">{r.user.name || r.user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{(r.caption || "(no caption)").slice(0, 100)}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* User Control + Roses Ledger */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* User Control */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">User Control</h2>
            <div className="space-y-3">
              {(filters.q ? data.usersMatchingQuery : data.recentUsers).map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl border border-border bg-secondary p-3">
                  <div>
                    <p className="text-sm font-black text-foreground">{u.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${u.isSuspended ? "text-red-400" : "text-green-400"}`}>
                      {u.isSuspended ? "Suspended" : "Active"} · 🌹 {u.roseBalance}
                    </p>
                  </div>
                  {canSuspend ? (
                    <form action={toggleUserSuspension}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="nextState" value={u.isSuspended ? "false" : "true"} />
                      <button className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wider ${u.isSuspended ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                        {u.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-lg bg-secondary border border-border px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">No access</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Roses Ledger */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Roses Ledger</h2>
              {adminRole === "superadmin" && (
                <div className="flex gap-2">
                  <a href="/api/admin/export/users" className="rounded-lg bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors">CSV Users</a>
                  <a href="/api/admin/export/roses" className="rounded-lg bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors">CSV Roses</a>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {data.recentRoseTransactions.map((tx) => (
                <div key={tx.id} className="rounded-xl border border-border bg-secondary p-3">
                  <p className="text-sm font-black text-foreground">{tx.user.name || tx.user.email}</p>
                  <p className="text-xs text-muted-foreground">{tx.type}</p>
                  <p className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount} roses · {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Moderation + Verifications */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Pending Verifications */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
              Pending Verifications
              {data.pendingVerifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] border border-primary/20">{data.pendingVerifications.length}</span>
              )}
            </h2>
            <div className="space-y-3">
              {data.pendingVerifications.length === 0 ? (
                <p className="text-xs text-muted-foreground">No pending verifications. ✓</p>
              ) : (
                data.pendingVerifications.map((v) => (
                  <div key={v.id} className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
                    <p className="text-sm font-black text-foreground">{v.user.name || v.user.email}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(v.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Post Comments Moderation */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Post Comments Queue</h2>
            <div className="space-y-3">
              {data.moderationPostComments.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-secondary p-3">
                  <p className="text-xs font-black text-foreground">{c.user.name || c.user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.text.slice(0, 120)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(c.createdAt).toLocaleString()}</p>
                  {canModerate && (
                    <form action={deletePostCommentAdmin} className="mt-2">
                      <input type="hidden" name="commentId" value={c.id} />
                      <button className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">Delete</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reel Comments Moderation */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Reel Comments Queue</h2>
            <div className="space-y-3">
              {data.moderationReelComments.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-secondary p-3">
                  <p className="text-xs font-black text-foreground">{c.user.name || c.user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.text.slice(0, 120)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(c.createdAt).toLocaleString()}</p>
                  {canModerate && (
                    <form action={deleteReelCommentAdmin} className="mt-2">
                      <input type="hidden" name="commentId" value={c.id} />
                      <button className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">Delete</button>
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
