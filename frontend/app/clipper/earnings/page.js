"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";

import {
  getMyClips,
  getWallet
} from "@/lib/api";

import { getCurrentUser } from "@/lib/auth";

export default function ClipperEarningsPage() {
  const router = useRouter();

  const [clips, setClips] = useState([]);

  const [wallet, setWallet] = useState({
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    transactions: []
  });

  const [user, setUser] = useState({
    displayName: "",
    role: ""
  });

  const [authChecked, setAuthChecked] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
  // LOAD EARNINGS DATA
  // ======================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        clipData,
        walletData
      ] = await Promise.all([
        getMyClips(),
        getWallet()
      ]);

      if (
        clipData?.__error ||
        walletData?.__error
      ) {
        setError(
          clipData?.message ||
          walletData?.message ||
          "Earnings could not be loaded."
        );

        return;
      }

      setClips(clipData || []);

      setWallet(
        walletData || {
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          transactions: []
        }
      );

    } catch (err) {
      console.error(
        "Failed to load earnings:",
        err
      );

      setError(
        "Earnings could not be loaded."
      );

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authChecked) {
      loadData();
    }
  }, [authChecked, loadData]);

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
  // CALCULATIONS
  // ======================================================

  const totalViews = clips.reduce(
    (sum, clip) =>
      sum + Number(clip.views || 0),
    0
  );

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
            <h1>Earnings</h1>

            <div className="greet">
              Track your verified views and
              clip earnings.
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
            icon="₹"
            iconBg="var(--violet-soft)"
            value={
              loading
                ? "—"
                : `₹${Number(
                    wallet.totalEarned || 0
                  ).toLocaleString("en-IN")}`
            }
            label="Total earned"
          />

          <KpiCard
            icon="▶"
            iconBg="var(--lime-soft)"
            value={
              loading
                ? "—"
                : formatViews(totalViews)
            }
            label="Verified views"
          />

          <KpiCard
            icon="✓"
            iconBg="var(--lime-soft)"
            value={
              loading
                ? "—"
                : approvedCount
            }
            label="Approved clips"
          />
          <KpiCard
            icon="₹"
            iconBg="var(--pink-soft)"
            value={
              loading
                ? "—"
                : `₹${Number(
                    wallet.balance || 0
                  ).toLocaleString("en-IN")}`
            }
            label="Available balance"
          />

        </div>

        {/* EARNINGS TABLE */}

        {!loading && !error && (
          <div
            className="panel"
            style={{
              marginTop: "8px"
            }}
          >

            <div className="panel-head">
              <div>
                <h3>Earnings by clip</h3>

                <div
                  style={{
                    color: "var(--text-dim)",
                    fontSize: "12px",
                    marginTop: "4px"
                  }}
                >
                  {clips.length} total submissions ·{" "}
                  {rejectedCount} rejected
                </div>
              </div>
            </div>

            <div
              style={{
                overflowX: "auto"
              }}
            >
              <table>

                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Platform</th>
                    <th>Views</th>
                    <th>Earned</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>

                  {clips.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "28px 20px",
                          color:
                            "var(--text-faint)"
                        }}
                      >
                        No earnings data yet.
                      </td>
                    </tr>
                  )}

                  {clips.map((clip) => {

                    const status =
                      clip.status?.toUpperCase() ||
                      "PENDING";

                    const earnings =
                      getClipEarnings(clip);

                    return (
                      <tr key={clip.id}>

                        {/* CAMPAIGN */}

                        <td>
                          <div className="t-name">
                            {clip.campaignName ||
                              "Campaign"}
                          </div>
                        </td>

                        {/* PLATFORM */}

                        <td>
                          <span
                            style={{
                              padding: "5px 9px",
                              borderRadius: "100px",
                              background:
                                "var(--violet-soft)",
                              color:
                                "var(--violet-bright)",
                              fontSize: "11px",
                              fontWeight: "600"
                            }}
                          >
                            {formatPlatform(
                              clip.platform
                            )}
                          </span>
                        </td>

                        {/* VIEWS */}

                        <td className="mono-cell">
                          {Number(
                            clip.views || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* EARNINGS */}

                        <td className="mono-cell">
                          ₹
                          {earnings.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`status ${getStatusClass(
                              status
                            )}`}
                          >
                            {formatStatus(status)}
                          </span>
                        </td>

                        {/* LINK */}

                        <td>
                          {clip.contentUrl ? (
                            <a
                              href={
                                clip.contentUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-small"
                            >
                              Open ↗
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}


// ======================================================
// HELPERS
// ======================================================

function getClipEarnings(clip) {
  if (
    clip.earnings !== undefined &&
    clip.earnings !== null
  ) {
    return Number(clip.earnings) || 0;
  }

  if (
    clip.earningsPaise !== undefined &&
    clip.earningsPaise !== null
  ) {
    return (
      Number(clip.earningsPaise) / 100
    );
  }

  return 0;
}


function formatPlatform(platform) {
  switch (platform?.toUpperCase()) {
    case "YOUTUBE":
      return "YouTube";

    case "INSTAGRAM":
      return "Instagram";

    case "TIKTOK":
      return "TikTok";

    default:
      return platform || "Unknown";
  }
}


function formatStatus(status) {
  switch (status) {
    case "APPROVED":
      return "Approved";

    case "REJECTED":
      return "Rejected";

    case "PENDING":
      return "In review";

    default:
      return status;
  }
}


function getStatusClass(status) {
  switch (status) {
    case "APPROVED":
      return "live";

    case "REJECTED":
      return "rejected";

    default:
      return "review";
  }
}


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
    ).toFixed(1)}K`;
  }

  return String(views);
}