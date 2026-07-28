"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    router.push("/");
  }

  function getDashboardPath() {
    if (user?.role === "CREATOR") {
      return "/brand";
    }

    if (user?.role === "CLIPPER") {
      return "/clipper";
    }

    return "/";
  }

  return (
    <nav className="topnav">
      <Link href="/" className="logo">
        <div className="logo-mark">CM</div>
        ClipMandi
      </Link>

      <div className="nav-links">
        <a href="#brands">For Brands</a>
        <a href="#clippers">For Clippers</a>
        <a href="#how">How it works</a>
        <a href="#pricing">Pricing</a>
      </div>

      <div className="nav-cta">
        {user ? (
          <>
            <Link
              className="btn btn-primary"
              href={getDashboardPath()}
            >
              Dashboard
            </Link>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleLogout}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              className="btn btn-ghost"
              href="/login"
            >
              Log in
            </Link>

            <Link
              className="btn btn-ghost"
              href="/register"
            >
              Register
            </Link>

            <Link
              className="btn btn-primary"
              href="/register"
            >
              Post a campaign
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}