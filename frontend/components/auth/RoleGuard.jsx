"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  getValidAccessToken,
  logout
} from "@/lib/auth";

export default function RoleGuard({
  requiredRole,
  children
}) {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const currentUser = getCurrentUser();

      // No local session at all.
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      // Make sure the access token is still valid.
      // If expired, auth.js will attempt refresh.
      const token = await getValidAccessToken();

      if (!active) {
        return;
      }

      if (!token) {
        logout();
        router.replace("/login");
        return;
      }

      // Correct role.
      if (currentUser.role === requiredRole) {
        setAllowed(true);
        return;
      }

      // Wrong dashboard.
      if (currentUser.role === "CREATOR") {
        router.replace("/brand");
        return;
      }

      if (currentUser.role === "CLIPPER") {
        router.replace("/clipper");
        return;
      }

      // Unknown/invalid role.
      logout();
      router.replace("/login");
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [requiredRole, router]);

  if (!allowed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <p
          style={{
            color: "var(--text-dim)"
          }}
        >
          Checking session...
        </p>
      </main>
    );
  }

  return children;
}