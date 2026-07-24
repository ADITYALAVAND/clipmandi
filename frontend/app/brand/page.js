"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";
import CampaignsTable from "@/components/dashboard/CampaignsTable";
import ClipInboxTable from "@/components/dashboard/ClipInboxTable";

import { getCampaigns, getClips } from "@/lib/api";
import { mockCampaigns, mockClips } from "@/lib/mockData";
import Link from "next/link";

export default function BrandDashboard() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [clips, setClips] = useState(mockClips);

  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [user, setUser] = useState({
    displayName: "",
    role: ""
  });

  // Check authentication first
  useEffect(() => {
    const currentUser = getCurrentUser();

    // No logged-in user
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    // User exists but isn't a creator
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

  // Load campaigns + clips
  const loadData = useCallback(async () => {
    setLoading(true);

    const [campaignData, clipData] = await Promise.all([
      getCampaigns(),
      getClips()
    ]);

    setCampaigns(campaignData || mockCampaigns);
    setClips(clipData || mockClips);

    setLoading(false);
  }, []);

  // Only load dashboard data after authentication succeeds
  useEffect(() => {
    if (authChecked) {
      loadData();
    }
  }, [authChecked, loadData]);

  // Don't show dashboard before authentication check finishes
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

  const totalSpent = campaigns.reduce(
    (sum, c) => sum + c.budgetSpent,
    0
  );

  const totalViews = campaigns.reduce(
    (sum, c) => sum + c.views,
    0
  );

  const totalClips = campaigns.reduce(
    (sum, c) => sum + c.clipsCount,
    0
  );

  return (
    <div className="dash">
      <Sidebar
        role="brand"
        userName={user.displayName}
        userRole="Creator account"
      />

      <main className="main">
        <div className="dash-header">
          <div>
            <h1>Overview</h1>

            <div className="greet">
              {loading
                ? "Loading campaigns…"
                : `Welcome back, ${user.displayName} — here's how your campaigns are trading today.`}
            </div>
          </div>

          <Link
            href="/brand/campaigns/new"
            className="btn btn-primary"
>
            + New campaign
          </Link>
        </div>

        <div className="cards-row">
          <KpiCard
            icon="₹"
            iconBg="var(--violet-soft)"
            trend="↑ 12%"
            value={`₹${totalSpent.toLocaleString("en-IN")}`}
            label="Spent this month"
          />

          <KpiCard
            icon="▶"
            iconBg="var(--violet-soft)"
            trend="↑ 34%"
            value={formatViews(totalViews)}
            label="Verified views"
          />

          <KpiCard
            icon="✎"
            iconBg="var(--pink-soft)"
            trend="↑ 8%"
            value={totalClips}
            label="Clips submitted"
          />

          <KpiCard
            icon="✓"
            iconBg="var(--lime-soft)"
            trend="↑ 5%"
            value="92%"
            label="Tier-1 audience"
          />
        </div>

        <CampaignsTable campaigns={campaigns} />

        <ClipInboxTable
          clips={clips}
          onUpdated={loadData}
        />
      </main>
    </div>
  );
}

function formatViews(n) {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }

  if (n >= 1000) {
    return `${(n / 1000).toFixed(0)}K`;
  }

  return String(n);
}