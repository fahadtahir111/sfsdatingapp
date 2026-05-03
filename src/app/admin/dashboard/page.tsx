import { AnalyticsService } from "@/lib/server/services/AnalyticsService";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function AdminDashboard() {
  const stats = await AnalyticsService.getPlatformStats();

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient-primary">Admin HQ</h1>
          <p className="text-muted-foreground font-medium">Real-time platform performance and scaling metrics.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.users.total} subtext={`${stats.users.active7d} active this week`} />
          <StatCard title="Matches" value={stats.engagement.totalMatches} subtext="Mutual interests" />
          <StatCard title="Revenue (Elite)" value={stats.revenue.activeEliteSubscriptions} subtext="Active subscriptions" />
          <StatCard title="Retention" value={`${stats.users.retentionRate.toFixed(1)}%`} subtext="Last 7 days" />
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="surface-card p-8">
            <h3 className="text-xl font-bold mb-6">Algorithm Performance</h3>
            <div className="space-y-6">
              <HealthItem label="EliteMatch™ Scoring" status="Optimal" delay="42ms" />
              <HealthItem label="SocialGraph™ Ranking" status="Healthy" delay="120ms" />
              <HealthItem label="Vector Search" status="Healthy" delay="85ms" />
            </div>
          </div>

          <div className="surface-card p-8 bg-luxury-mesh">
            <h3 className="text-xl font-bold mb-6 text-primary">Revenue Pulse</h3>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="text-5xl font-black mb-2 text-white">{stats.revenue.activeEliteSubscriptions}</div>
                <div className="text-xs uppercase tracking-widest text-primary font-bold">Elite Memberships</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, subtext }: { title: string; value: string | number; subtext: string }) {
  return (
    <div className="surface-card p-8 hover:border-primary/50 transition-colors">
      <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">{title}</div>
      <div className="text-4xl font-black mb-2">{value}</div>
      <div className="text-sm font-medium text-muted-foreground">{subtext}</div>
    </div>
  );
}

function HealthItem({ label, status, delay }: { label: string; status: string; delay: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-bold">{label}</div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-muted-foreground">{delay}</span>
        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-tighter rounded-full border border-green-500/20">
          {status}
        </span>
      </div>
    </div>
  );
}
