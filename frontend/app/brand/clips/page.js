"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";
import ClipInboxTable from "@/components/dashboard/ClipInboxTable";

import { getClips } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function BrandClipsPage() {
  const router = useRouter();

  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [authChecked, setAuthChecked] =
    useState(false);

  const [user, setUser] = useState({
    displayName: "",
    role: ""
  });

  // ======================================================
  // AUTHENTICATION
  // ======================================================

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
      displayName:
        currentUser.displayName || "Creator",
      role: currentUser.role
    });

    setAuthChecked(true);
  }, [router]);

  // ======================================================
  // LOAD CLIPS
  // ======================================================

  const loadClips = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getClips();

      if (data?.__error || !data) {
        setError(
          data?.message ||
            "Clip inbox could not be loaded."
        );

        return;
      }

      setClips(data);

    } catch (err) {
      console.error(
        "Failed to load clip inbox:",
        err
      );

      setError(
        "Clip inbox could not be loaded."
      );

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authChecked) {
      loadClips();
    }
  }, [authChecked, loadClips]);

  // ======================================================
  // AUTH LOADING
  // ======================================================

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
  // CLIP STATISTICS
  // ======================================================

  const pendingCount = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() ===
      "PENDING"
  ).length;

  const approvedCount = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() ===
      "APPROVED"
  ).length;

  const rejectedCount = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() ===
      "REJECTED"
  ).length;

  const totalViews = clips.reduce(
    (sum, clip) =>
      sum + Number(clip.views || 0),
    0
  );

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="dash">

      <Sidebar
        role="brand"
        userName={user.displayName}
        userRole="Creator account"
      />

      <main className="main">

        {/* HEADER */}

        <div className="dash-header">
          <div>
            <h1>Clip inbox</h1>

            <div className="greet">
              Review and manage clips submitted
              to your campaigns.
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="panel"
            style={{
              padding: "18px",
              marginBottom: "20px"
            }}
          >
            <span
              style={{
                color: "var(--text-dim)"
              }}
            >
              {error}
            </span>
          </div>
        )}

        {/* KPI CARDS */}

        <div className="cards-row">

          <KpiCard
            icon="⧗"
            iconBg="var(--violet-soft)"
            value={
              loading ? "—" : pendingCount
            }
            label="Pending review"
          />

          <KpiCard
            icon="✓"
            iconBg="var(--lime-soft)"
            value={
              loading ? "—" : approvedCount
            }
            label="Approved clips"
          />

          <KpiCard
            icon="×"
            iconBg="var(--pink-soft)"
            value={
              loading ? "—" : rejectedCount
            }
            label="Rejected clips"
          />

          <KpiCard
            icon="▶"
            iconBg="var(--violet-soft)"
            value={
              loading
                ? "—"
                : formatViews(totalViews)
            }
            label="Verified views"
          />

        </div>

        {/* EXISTING REAL CLIP INBOX */}

        {!loading && !error && (
          <ClipInboxTable
            clips={clips}
            onUpdated={loadClips}
          />
        )}

      </main>
    </div>
  );
}


// ======================================================
// VIEW FORMATTER
// ======================================================

function formatViews(n) {
  const views = Number(n || 0);

  if (views >= 1000000) {
    return `${(
      views / 1000000
    ).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${(
      views / 1000
    ).toFixed(0)}K`;
  }

  return String(views);
}