"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/components/dashboard/Sidebar";
import { createCampaign } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function NewCampaignPage() {
  
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);

  const [user, setUser] = useState({
    displayName: "",
    role: ""
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Music",
    cpm: "",
    budgetTotal: "",
    allowedPlatforms: [],
    rules: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role !== "CREATOR") {
      router.replace("/clipper");
      return;
    }

    setUser({
      displayName: currentUser.displayName || "Creator",
      role: currentUser.role
    });

    setAuthChecked(true);
  }, [router]);

  // --------------------------------------------------
  // Normal input changes
  // --------------------------------------------------

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  // --------------------------------------------------
  // Platform selection
  // --------------------------------------------------

  function togglePlatform(platform) {
    setForm((current) => {
      const selected = current.allowedPlatforms.includes(platform);

      return {
        ...current,
        allowedPlatforms: selected
          ? current.allowedPlatforms.filter((item) => item !== platform)
          : [...current.allowedPlatforms, platform]
      };
    });
  }

  // --------------------------------------------------
  // Submit campaign
  // --------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    if (!form.cpm || Number(form.cpm) <= 0) {
      setError("Enter a valid CPM.");
      return;
    }

    if (!form.budgetTotal || Number(form.budgetTotal) < 100) {
      setError("Minimum campaign budget is ₹100.");
      return;
    }

    if (form.allowedPlatforms.length === 0) {
      setError("Select at least one platform.");
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(),

      description: form.description.trim() || null,

      category: form.category,

      cpm: Number(form.cpm),

      budgetTotal: Number(form.budgetTotal),

      allowedPlatforms: form.allowedPlatforms,

      rules: form.rules.trim() || null
    };

    const result = await createCampaign(payload);

    setLoading(false);

    if (result?.__error) {
  setError(
    result.message ||
      "Campaign could not be created. Please check your details and try again."
  );
  return;
}

    if (!result) {
  setError(
    "Campaign could not be created. Please check your details and try again."
  );
  return;
}

// Campaign created successfully
router.push("/brand");
}

// --------------------------------------------------
// Authentication loading
// --------------------------------------------------

  // --------------------------------------------------
  // Authentication loading
  // --------------------------------------------------

  if (!authChecked) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <p style={{ color: "var(--text-dim)" }}>
          Checking session...
        </p>
      </main>
    );
  }

  return (
    <div className="dash">
      <Sidebar
        role="brand"
        userName={user.displayName}
        userRole="Creator account"
      />

      <main className="main">
        {/* HEADER */}

        <div
          className="dash-header"
          style={{
            alignItems: "center"
          }}
        >
          <div>
            <Link
              href="/brand"
              className="link-small"
              style={{
                display: "inline-block",
                marginBottom: "12px"
              }}
            >
              ← Back to dashboard
            </Link>

            <h1>Create campaign</h1>

            <div className="greet">
              Set your budget, CPM and platforms. Clippers will be able to
              discover your campaign.
            </div>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="panel form-panel"
          style={{
            maxWidth: "820px"
          }}
        >
          {/* BASIC INFORMATION */}

          <div
            style={{
              marginBottom: "30px"
            }}
          >
            <h3
              style={{
                marginBottom: "6px"
              }}
            >
              Campaign details
            </h3>

            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "13px"
              }}
            >
              Tell clippers what you're promoting.
            </p>
          </div>

          <div className="form-row">
            <label>Campaign name</label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Example: Summer Music Push"
              maxLength={100}
              required
            />
          </div>

          <div className="form-row">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your campaign and what kind of clips you're looking for..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <label>Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Music">Music</option>
              <option value="Fashion">Fashion</option>
              <option value="Fitness">Fitness</option>
              <option value="Gaming">Gaming</option>
              <option value="Technology">Technology</option>
              <option value="Food">Food</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* MONEY */}

          <div
            style={{
              marginTop: "36px",
              marginBottom: "22px"
            }}
          >
            <h3
              style={{
                marginBottom: "6px"
              }}
            >
              Budget & rewards
            </h3>

            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "13px"
              }}
            >
              Decide how much clippers earn and how much you want to spend.
            </p>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>CPM (₹ per 1,000 views)</label>

              <input
                type="number"
                name="cpm"
                value={form.cpm}
                onChange={handleChange}
                placeholder="75"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-row">
              <label>Total budget (₹)</label>

              <input
                type="number"
                name="budgetTotal"
                value={form.budgetTotal}
                onChange={handleChange}
                placeholder="5000"
                min="100"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* PLATFORM */}

          <div
            style={{
              marginTop: "28px",
              marginBottom: "16px"
            }}
          >
            <h3
              style={{
                marginBottom: "6px"
              }}
            >
              Allowed platforms
            </h3>

            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "13px"
              }}
            >
              Choose where clippers are allowed to publish.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "30px"
            }}
          >
            <PlatformButton
              label="Instagram"
              selected={form.allowedPlatforms.includes("INSTAGRAM")}
              onClick={() => togglePlatform("INSTAGRAM")}
            />

            <PlatformButton
              label="YouTube"
              selected={form.allowedPlatforms.includes("YOUTUBE")}
              onClick={() => togglePlatform("YOUTUBE")}
            />

            <PlatformButton
              label="TikTok"
              selected={form.allowedPlatforms.includes("TIKTOK")}
              onClick={() => togglePlatform("TIKTOK")}
            />
          </div>

          {/* RULES */}

          <div className="form-row">
            <label>Campaign rules</label>

            <textarea
              name="rules"
              value={form.rules}
              onChange={handleChange}
              placeholder="Example: No misleading captions. Keep clips at least 15 seconds long..."
              rows={5}
            />
          </div>

          {/* SUMMARY */}

          <div
            style={{
              marginTop: "26px",
              padding: "18px",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              background: "var(--bg-2)"
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-dim)",
                marginBottom: "8px"
              }}
            >
              CAMPAIGN SUMMARY
            </div>

            <div
              style={{
                display: "flex",
                gap: "30px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-faint)"
                  }}
                >
                  CPM
                </div>

                <strong>
                  ₹{form.cpm || "0"} / 1K views
                </strong>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-faint)"
                  }}
                >
                  BUDGET
                </div>

                <strong>
                  ₹{form.budgetTotal || "0"}
                </strong>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-faint)"
                  }}
                >
                  PLATFORMS
                </div>

                <strong>
                  {form.allowedPlatforms.length || 0}
                </strong>
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px 14px",
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

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "28px"
            }}
          >
            <Link
              href="/brand"
              className="btn btn-ghost"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Creating campaign..."
                : "Create campaign"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}


// ======================================================
// PLATFORM BUTTON
// ======================================================

function PlatformButton({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 16px",

        borderRadius: "10px",

        border: selected
          ? "1px solid var(--violet)"
          : "1px solid var(--border)",

        background: selected
          ? "var(--violet-soft)"
          : "var(--surface)",

        color: selected
          ? "var(--violet-bright)"
          : "var(--text-dim)",

        fontWeight: "600",

        transition: "all 0.2s ease"
      }}
    >
      {selected ? "✓ " : ""}
      {label}
    </button>
  );
}