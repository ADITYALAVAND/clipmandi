"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  login,
  getCurrentUser
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // ======================================================
  // REDIRECT ALREADY LOGGED-IN USERS
  // ======================================================

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser?.role === "CREATOR") {
      router.replace("/brand");
      return;
    }

    if (currentUser?.role === "CLIPPER") {
      router.replace("/clipper");
      return;
    }

    setCheckingSession(false);
  }, [router]);

  // ======================================================
  // LOGIN
  // ======================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(
        email.trim(),
        password
      );

      if (data.role === "CREATOR") {
        router.replace("/brand");
        return;
      }

      if (data.role === "CLIPPER") {
        router.replace("/clipper");
        return;
      }

      setError("Unsupported account role.");
    } catch (err) {
      setError(
        err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // SESSION CHECK
  // ======================================================

  if (checkingSession) {
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

  // ======================================================
  // UI
  // ======================================================

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px"
        }}
      >
        <Link
          href="/"
          className="logo"
          style={{
            justifyContent: "center",
            marginBottom: "32px"
          }}
        >
          <div className="logo-mark">
            CM
          </div>

          ClipMandi
        </Link>

        <form
          onSubmit={handleSubmit}
          className="panel form-panel"
        >
          <div
            style={{
              marginBottom: "26px"
            }}
          >
            <div
              className="eyebrow"
              style={{
                marginBottom: "16px"
              }}
            >
              <span className="dot"></span>
              WELCOME BACK
            </div>

            <h1
              style={{
                fontSize: "32px",
                marginBottom: "8px"
              }}
            >
              Log in to ClipMandi
            </h1>

            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "14px",
                lineHeight: "1.6"
              }}
            >
              Continue to your creator or clipper
              dashboard.
            </p>
          </div>

          <div className="form-row">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />
          </div>

          <div className="form-row">
            <label>Password</label>

            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px 14px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#f8717115",
                border: "1px solid #f8717135",
                color: "#f87171",
                fontSize: "13px"
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{
              width: "100%"
            }}
          >
            {loading
              ? "Logging in..."
              : "Log in"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "13px",
              color: "var(--text-dim)"
            }}
          >
            New to ClipMandi?{" "}

            <Link
              href="/register"
              style={{
                color: "var(--violet-bright)",
                fontWeight: "600"
              }}
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}