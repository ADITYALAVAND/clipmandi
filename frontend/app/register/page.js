"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "CLIPPER"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await register(
        form.email.trim(),
        form.password,
        form.displayName.trim(),
        form.role
      );

      if (data.role === "CREATOR") {
        router.push("/brand");
      } else if (data.role === "CLIPPER") {
        router.push("/clipper");
      } else {
        setError("Unsupported account role.");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

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
          maxWidth: "460px"
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
          <div className="logo-mark">CM</div>
          ClipMandi
        </Link>

        <form
          onSubmit={handleSubmit}
          className="panel form-panel"
        >
          <div style={{ marginBottom: "26px" }}>
            <div
              className="eyebrow"
              style={{
                marginBottom: "16px"
              }}
            >
              <span className="dot"></span>
              JOIN THE MANDI
            </div>

            <h1
              style={{
                fontSize: "32px",
                marginBottom: "8px"
              }}
            >
              Create your account
            </h1>

            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "14px",
                lineHeight: "1.6"
              }}
            >
              Join as a creator running campaigns or a clipper
              earning from content.
            </p>
          </div>

          <div className="form-row">
            <label>Display name</label>

            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="Your name or brand"
              required
            />
          </div>

          <div className="form-row">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-row">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>

          <div className="form-row">
            <label>I want to join as</label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px"
              }}
            >
              <RoleButton
                title="Clipper"
                description="Create clips & earn"
                selected={form.role === "CLIPPER"}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    role: "CLIPPER"
                  }))
                }
              />

              <RoleButton
                title="Creator"
                description="Launch campaigns"
                selected={form.role === "CREATOR"}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    role: "CREATOR"
                  }))
                }
              />
            </div>
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
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "4px"
            }}
          >
            {loading
              ? "Creating account..."
              : form.role === "CLIPPER"
                ? "Join as Clipper"
                : "Join as Creator"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "13px",
              color: "var(--text-dim)"
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--violet-bright)",
                fontWeight: "600"
              }}
            >
              Log in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function RoleButton({
  title,
  description,
  selected,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "16px",
        borderRadius: "12px",
        textAlign: "left",

        border: selected
          ? "1px solid var(--violet)"
          : "1px solid var(--border)",

        background: selected
          ? "var(--violet-soft)"
          : "var(--bg-2)",

        color: selected
          ? "var(--text)"
          : "var(--text-dim)",

        transition: "all 0.2s ease"
      }}
    >
      <div
        style={{
          fontWeight: "650",
          marginBottom: "5px"
        }}
      >
        {selected ? "✓ " : ""}
        {title}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "var(--text-faint)"
        }}
      >
        {description}
      </div>
    </button>
  );
}