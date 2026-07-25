"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [authChecked, setAuthChecked] = useState(false);

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
      displayName: currentUser.displayName || "Creator",
      role: currentUser.role
    });

    setAuthChecked(true);
  }, [router]);

  // ======================================================
  // LOAD REAL DASHBOARD DATA
  // ======================================================

  const loadData = useCallback(async () => {
    setLoading(true);

    const [campaignData, clipData] = await Promise.all([
      getCampaigns(),
      getClips()
    ]);

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

    setLoading(false);
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
        <p style={{ color: "var(--text-dim)" }}>
          Checking session...
        </p>
      </main>
    );
  }

  // ======================================================
  // REAL CREATOR STATISTICS
  // ======================================================

  const totalSpent = campaigns.reduce(
    (sum, campaign) =>
      sum + Number(campaign.budgetSpent || 0),
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
      clip.status?.toUpperCase() === "PENDING"
  ).length;

  // ======================================================
  // ADD REAL CLIP STATS TO EACH CAMPAIGN
  // ======================================================

  const campaignsWithStats = campaigns.map((campaign) => {
    const campaignClips = clips.filter(
      (clip) => clip.campaignId === campaign.id
    );

    const campaignViews = campaignClips.reduce(
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
                ? "Loading campaigns…"
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

        {/* KPI CARDS */}

        <div className="cards-row">

          <KpiCard
            icon="₹"
            iconBg="var(--violet-soft)"
            value={`₹${totalSpent.toLocaleString(
              "en-IN"
            )}`}
            label="Total campaign spend"
          />

          <KpiCard
            icon="▶"
            iconBg="var(--violet-soft)"
            value={formatViews(totalViews)}
            label="Verified views"
          />

          <KpiCard
            icon="✎"
            iconBg="var(--pink-soft)"
            value={totalClips}
            label="Clips submitted"
          />

          <KpiCard
            icon="⧗"
            iconBg="var(--lime-soft)"
            value={pendingClips}
            label="Pending review"
          />

        </div>

        {/* CAMPAIGNS */}

        <CampaignsTable
          campaigns={campaignsWithStats}
        />

        {/* CLIP REVIEW INBOX */}

        <ClipInboxTable
          clips={clips}
          onUpdated={loadData}
        />

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
    return `${(views / 1000000).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K`;
  }

  return String(views);
}