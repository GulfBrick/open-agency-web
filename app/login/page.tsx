"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/app/components/Nav";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No account found. Check the email or sign up at /pricing.");
        setLoading(false);
        return;
      }

      // Store clientId and go to portal
      if (data.clientId) {
        try { localStorage.setItem("oa_client_id", data.clientId); } catch { /* noop */ }
      }
      router.push("/portal");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="login-page">
        <div className="login-card">
          <div className="login-logo">👩‍💼</div>
          <h1 className="login-title">Access your portal</h1>
          <p className="login-sub">
            Enter the email you signed up with. We&apos;ll bring up your client portal.
          </p>

          <form className="login-form" onSubmit={handleLookup}>
            <input
              className="login-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
            {error && <div className="login-error">{error}</div>}
            <button
              className="login-btn"
              type="submit"
              disabled={loading || !email.trim()}
            >
              {loading ? "Looking up..." : "Access Portal →"}
            </button>
          </form>

          <div className="login-footer">
            Don&apos;t have an account?{" "}
            <Link href="/pricing" className="login-link">See pricing</Link>
            {" "}·{" "}
            <Link href="/onboard" className="login-link">Get started</Link>
          </div>
        </div>
      </main>
    </>
  );
}
