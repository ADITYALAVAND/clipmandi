"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

const BRAND_LINKS = [
  {
    label: "Overview",
    icon: "▦",
    href: "/brand"
  },
  {
    label: "Campaigns",
    icon: "◆",
    href: "/brand/campaigns"
  },
  {
    label: "Clip inbox",
    icon: "✉",
    href: "/brand/clips"
  },
  {
    label: "Payouts",
    icon: "₹",
    href: "/brand/payouts"
  },
  {
    label: "Settings",
    icon: "⚙",
    href: "/brand/settings"
  }
];

const CLIPPER_LINKS = [
  {
    label: "Browse campaigns",
    icon: "▦",
    href: "/clipper"
  },
  {
    label: "My clips",
    icon: "✎",
    href: "/clipper/my-clips"
  },
  {
    label: "Earnings",
    icon: "₹",
    href: "/clipper/earnings"
  },
  {
    label: "Wallet",
    icon: "▤",
    href: "/clipper/wallet"
  },
  {
    label: "Profile",
    icon: "⚙",
    href: "/clipper/profile"
  }
];

export default function Sidebar({
  role,
  userName,
  userRole
}) {
  const router = useRouter();
  const pathname = usePathname();

  const links =
    role === "brand"
      ? BRAND_LINKS
      : CLIPPER_LINKS;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  function isActive(href) {
    // Dashboard routes must match exactly.
    if (
      href === "/clipper" ||
      href === "/brand"
    ) {
      return pathname === href;
    }

    // Child pages can match nested routes.
    return pathname.startsWith(href);
  }

  return (
    <aside className="sidebar">

      <Link className="logo" href="/">
        <div className="logo-mark">
          CM
        </div>

        ClipMandi
      </Link>

      {links.map((link) => (
        <Link
          href={link.href}
          className={`side-link ${
            isActive(link.href)
              ? "active"
              : ""
          }`}
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
                fontFamily:
                  "'JetBrains Mono', monospace",
                fontSize: "11px",
                background:
                  "var(--violet-soft)",
                color:
                  "var(--violet-bright)",
                padding: "2px 7px",
                borderRadius: "100px"
              }}
            >
              {link.badge}
            </span>
          )}
        </Link>
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
          <span className="ic">
            ↪
          </span>

          Log out
        </button>

      </div>

    </aside>
  );
}