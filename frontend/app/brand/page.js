"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { getCampaigns, getClips } from "@/lib/api";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";
import CampaignsTable from "@/components/dashboard/CampaignsTable";
import ClipInboxTable from "@/components/dashboard/ClipInboxTable";

export default function BrandDashboard() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState([]);
  const [clips, setClips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] =
    useState(false);

  const [error, setError] = useState("");

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
  // LOAD DASHBOARD DATA
  // ======================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        campaignData,
        clipData
      ] = await Promise.all([
        getCampaigns(),
        getClips()
      ]);

      if (
        campaignData?.__error ||
        clipData?.__error
      ) {
        setError(
          campaignData?.message ||
            clipData?.message ||
            "Dashboard data could not be loaded."
        );
      }

      setCampaigns(
        campaignData?.__error
          ? []
          : campaignData || []
      );

      setClips(
        clipData?.__error
          ? []
          : clipData || []
      );

    } catch (err) {
      console.error(
        "Failed to load creator dashboard:",
        err
      );

      setError(
        "Dashboard data could not be loaded."
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
  // CREATOR STATISTICS
  // ======================================================

  const totalSpent = campaigns.reduce(
    (sum, campaign) =>
      sum +
      Number(campaign.budgetSpent || 0),
    0
  );

  const totalViews = clips.reduce(
    (sum, clip) =>
      sum + Number(clip.views || 0),
    0
  );

  const totalClips = clips.length;

  const pendingClips = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() ===
      "PENDING"
  );

  // ======================================================
  // CAMPAIGN STATISTICS
  // ======================================================

  const campaignsWithStats =
    campaigns.map((campaign) => {
      const campaignClips = clips.filter(
        (clip) =>
          clip.campaignId === campaign.id
      );

      const campaignViews =
        campaignClips.reduce(
          (sum, clip) =>
            sum + Number(clip.views || 0),
          0
        );

      return {
        ...campaign,
        views: campaignViews,
        clipsCount: campaignClips.length
      };
    });

  // Overview only needs previews.
  const recentCampaigns =
    campaignsWithStats.slice(0, 3);

  const recentClips =
    clips.slice(0, 5);

  // ======================================================
  // DASHBOARD
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
            <h1>Overview</h1>

            <div className="greet">
              {loading
                ? "Loading your dashboard..."
                : `Welcome back, ${user.displayName} — here's how your campaigns are performing.`}
            </div>
          </div>

          <Link
            href="/brand/campaigns/new"
            className="btn btn-primary"
          >
            + New campaign
          </Link>

        </div>

        {/* ERROR */}

        {error && (
          <div
            className="panel"
            style={{
              padding: "16px 18px",
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
                : `₹${totalSpent.toLocaleString(
                    "en-IN"
                  )}`
            }
            label="Total campaign spend"
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

          <KpiCard
            icon="✎"
            iconBg="var(--pink-soft)"
            value={
              loading
                ? "—"
                : totalClips
            }
            label="Clips submitted"
          />

          <KpiCard
            icon="⌛"
            iconBg="var(--lime-soft)"
            value={
              loading
                ? "—"
                : pendingClips.length
            }
            label="Pending review"
          />

        </div>

        {/* NEEDS ATTENTION */}

        {!loading &&
          pendingClips.length > 0 && (
            <div
              className="panel"
              style={{
                padding: "20px 24px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "20px"
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "650",
                    marginBottom: "5px"
                  }}
                >
                  {pendingClips.length === 1
                    ? "1 clip is waiting for your review"
                    : `${pendingClips.length} clips are waiting for your review`}
                </div>

                <div
                  style={{
                    color:
                      "var(--text-dim)",
                    fontSize: "13px"
                  }}
                >
                  Review new submissions and
                  approve or reject them.
                </div>
              </div>

              <Link
                href="/brand/clips"
                className="btn btn-primary"
                style={{
                  whiteSpace: "nowrap"
                }}
              >
                Review clips →
              </Link>
            </div>
          )}

        {/* CAMPAIGN PREVIEW */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "12px"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                margin: 0
              }}
            >
              Campaign performance
            </h2>
          </div>

          <Link
            href="/brand/campaigns"
            className="link-small"
          >
            View all campaigns →
          </Link>
        </div>

        {!loading &&
          recentCampaigns.length > 0 && (
            <CampaignsTable
              campaigns={recentCampaigns}
            />
          )}

        {!loading &&
          campaigns.length === 0 && (
            <div
              className="panel"
              style={{
                padding: "32px",
                textAlign: "center"
              }}
            >
              <h3>
                No campaigns yet
              </h3>

              <p
                style={{
                  color:
                    "var(--text-dim)",
                  marginBottom: "18px"
                }}
              >
                Create your first campaign
                to start receiving clips.
              </p>

              <Link
                href="/brand/campaigns/new"
                className="btn btn-primary"
              >
                + Create campaign
              </Link>
            </div>
          )}

        {/* RECENT SUBMISSIONS */}

        {!loading &&
          recentClips.length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginTop: "28px",
                  marginBottom: "12px"
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    margin: 0
                  }}
                >
                  Recent submissions
                </h2>

                <Link
                  href="/brand/clips"
                  className="link-small"
                >
                  View clip inbox →
                </Link>
              </div>

              <ClipInboxTable
                clips={recentClips}
                onUpdated={loadData}
              />
            </>
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