"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const BRAND_LINKS = [
  { label: "Overview", icon: "▦", active: true },
  { label: "Campaigns", icon: "◆" },
  { label: "Clip inbox", icon: "✉", badge: "18" },
  { label: "Payouts", icon: "₹" },
  { label: "Settings", icon: "⚙" }
];

const CLIPPER_LINKS = [
  { label: "Browse campaigns", icon: "▦", active: true },
  { label: "My clips", icon: "✎" },
  { label: "Earnings", icon: "₹" },
  { label: "Wallet", icon: "▤" },
  { label: "Profile", icon: "⚙" }
];

export default function Sidebar({ role, userName, userRole }) {
  const router = useRouter();

  const links = role === "brand" ? BRAND_LINKS : CLIPPER_LINKS;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="sidebar">

      <Link className="logo" href="/">
        <div className="logo-mark">CM</div>
        ClipMandi
      </Link>

      {links.map((link) => (
        <a
          className={`side-link ${link.active ? "active" : ""}`}
          key={link.label}
        >
          <span className="ic">
            {link.icon}
          </span>

          {link.label}

          {link.badge && (
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                background: "var(--violet-soft)",
                color: "var(--violet-bright)",
                padding: "2px 7px",
                borderRadius: "100px"
              }}
            >
              {link.badge}
            </span>
          )}
        </a>
      ))}

      <div className="side-bottom">

        <div className="side-user">
          <div className="avatar"></div>

          <div>
            <div className="name">
              {userName}
            </div>

            <div className="role">
              {userRole}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="side-link"
          style={{
            width: "100%",
            marginTop: "8px",
            background: "transparent",
            border: "none",
            textAlign: "left"
          }}
        >
          <span className="ic">↪</span>
          Log out
        </button>

      </div>

    </aside>
  );
}