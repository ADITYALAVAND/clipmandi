"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";
import MyClipsTable from "@/components/dashboard/MyClipsTable";

import { getMyClips } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function ClipperMyClipsPage() {
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

    if (currentUser.role !== "CLIPPER") {
      router.replace("/brand");
      return;
    }

    setUser({
      displayName:
        currentUser.displayName || "Clipper",
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
      const data = await getMyClips();

      if (data?.__error || !data) {
        setError(
          data?.message ||
            "Your clips could not be loaded."
        );

        return;
      }

      setClips(data);

    } catch (err) {
      console.error(
        "Failed to load clips:",
        err
      );

      setError(
        "Your clips could not be loaded."
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
  // STATS
  // ======================================================

  const approvedCount = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() ===
      "APPROVED"
  ).length;

  const pendingCount = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() ===
      "PENDING"
  ).length;

  const rejectedCount = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() ===
      "REJECTED"
  ).length;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="dash">

      <Sidebar
        role="clipper"
        userName={user.displayName}
        userRole="Clipper account"
      />

      <main className="main">

        {/* HEADER */}

        <div className="dash-header">
          <div>
            <h1>My clips</h1>

            <div className="greet">
              Track all your campaign submissions
              in one place.
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
            icon="✎"
            iconBg="var(--violet-soft)"
            value={loading ? "—" : clips.length}
            label="Total clips"
          />

          <KpiCard
            icon="✓"
            iconBg="var(--lime-soft)"
            value={
              loading ? "—" : approvedCount
            }
            label="Approved"
          />

          <KpiCard
            icon="⧗"
            iconBg="var(--violet-soft)"
            value={
              loading ? "—" : pendingCount
            }
            label="Pending review"
          />

          <KpiCard
            icon="×"
            iconBg="var(--pink-soft)"
            value={
              loading ? "—" : rejectedCount
            }
            label="Rejected"
          />

        </div>

        {/* CLIPS */}

        {!loading && !error && (
          <div
            style={{
              marginTop: "8px"
            }}
          >
            <MyClipsTable
                clips={clips}
                showViewAll={false}
              />
          </div>
        )}

      </main>
    </div>
  );
}