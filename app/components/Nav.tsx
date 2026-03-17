"use client";

import Link from "next/link";
import Image from "next/image";
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
          <Image
            src="/logo.png"
            alt="Open Agency"
            width={36}
            height={36}
            style={{ borderRadius: "12px", display: "block" }}
            priority
          />
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
          <Link href="/pricing" className="site-nav-btn">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
