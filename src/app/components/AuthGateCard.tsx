import Link from "next/link";

export default function AuthGateCard({
  emoji,
  title,
  description,
  ctaLabel = "Sign In",
}: {
  emoji: string;
  title: string;
  description: string;
  ctaLabel?: string;
}) {
  return (
    <div className="page-shell min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center">
      <div className="w-24 h-24 bg-muted border border-border rounded-full flex items-center justify-center shadow-sm">
        <span className="text-4xl" aria-hidden>
          {emoji}
        </span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-foreground mb-2 font-heading">{title}</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">{description}</p>
      </div>
      <Link
        href="/auth/login"
        className="px-10 py-4 bg-foreground text-background font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs focus-ring"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
