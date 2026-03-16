import Link from "next/link";
import Nav from "@/app/components/Nav";

export const metadata = {
  title: "Client Portal — Open Agency",
  description: "Access your AI team, view active tasks, read reports from your agents.",
};

export default function PortalPage() {
  return (
    <>
      <Nav />
      <main className="portal-page">
        <div className="portal-container">
          <div className="portal-coming-soon">Client Portal</div>
          <p className="portal-sub">
            Sign in to see your assigned agents, active tasks, and reports from your team.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
            Authentication coming shortly. In the meantime, use the Agency HQ dashboard to monitor your team.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: "white",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}>
              Agency HQ →
            </Link>
            <Link href="/onboard" style={{
              padding: "12px 24px",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
