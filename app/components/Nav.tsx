"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Agency HQ" },
  { href: "/pricing", label: "Pricing" },
  { href: "/onboard", label: "Get Started" },
  { href: "/integrations", label: "Integrations" },
  { href: "/portal", label: "Client Portal" },
  { href: "/login", label: "Login" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-logo">
          <span className="site-nav-logo-mark">OA</span>
          <span className="site-nav-logo-name">Open Agency</span>
        </Link>
        <div className="site-nav-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`site-nav-link${pathname === link.href ? " active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="site-nav-cta">
          <Link href="/onboard" className="site-nav-btn">
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
