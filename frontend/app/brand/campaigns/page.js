"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";
import CampaignsTable from "@/components/dashboard/CampaignsTable";

import {
  getCampaigns,
  getClips,
  fundCampaign
} from "@/lib/api";

import { getCurrentUser } from "@/lib/auth";

export default function BrandCampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState([]);
  const [clips, setClips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] =
    useState(false);

  const [error, setError] = useState("");
  const [fundingId, setFundingId] = useState(null);

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
  // LOAD CAMPAIGNS
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
            "Campaigns could not be loaded."
        );

        return;
      }

      setCampaigns(campaignData || []);
      setClips(clipData || []);

    } catch (err) {
      console.error(
        "Failed to load campaigns:",
        err
      );

      setError(
        "Campaigns could not be loaded."
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
// DEV: FUND CAMPAIGN
// ======================================================

async function handleFundCampaign(campaignId) {
  setFundingId(campaignId);
  setError("");

  try {
    const result = await fundCampaign(campaignId);

    if (result?.__error || !result) {
      setError(
        result?.message ||
          "Campaign could not be funded."
      );
      return;
    }

    // Reload campaigns so PENDING_FUNDING becomes LIVE.
    await loadData();

  } catch (err) {
    console.error(
      "Failed to fund campaign:",
      err
    );

    setError(
      "Campaign could not be funded."
    );

  } finally {
    setFundingId(null);
  }
}

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
  // CAMPAIGN STATS
  // ======================================================

  const liveCampaigns = campaigns.filter(
    (campaign) =>
      campaign.status?.toUpperCase() === "LIVE"
  ).length;

  const totalBudget = campaigns.reduce(
    (sum, campaign) =>
      sum + Number(campaign.budgetTotal || 0),
    0
  );

  const totalSpent = campaigns.reduce(
    (sum, campaign) =>
      sum + Number(campaign.budgetSpent || 0),
    0
  );

  // ======================================================
  // ADD CLIP STATS
  // ======================================================

  const campaignsWithStats = campaigns.map(
    (campaign) => {
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
    }
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
            <h1>Campaigns</h1>

            <div className="greet">
              Manage all your creator campaigns
              in one place.
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
            icon="◆"
            iconBg="var(--violet-soft)"
            value={
              loading
                ? "—"
                : campaigns.length
            }
            label="Total campaigns"
          />

          <KpiCard
            icon="●"
            iconBg="var(--lime-soft)"
            value={
              loading
                ? "—"
                : liveCampaigns
            }
            label="Live campaigns"
          />

          <KpiCard
            icon="₹"
            iconBg="var(--violet-soft)"
            value={
              loading
                ? "—"
                : `₹${totalBudget.toLocaleString(
                    "en-IN"
                  )}`
            }
            label="Total budget"
          />

          <KpiCard
            icon="↗"
            iconBg="var(--pink-soft)"
            value={
              loading
                ? "—"
                : `₹${totalSpent.toLocaleString(
                    "en-IN"
                  )}`
            }
            label="Total spent"
          />

        </div>

        {/* CAMPAIGN TABLE */}

        {!loading && !error && (
          <CampaignsTable
            campaigns={campaignsWithStats}
            onFund={handleFundCampaign}
            fundingId={fundingId}
          />
        )}

      </main>

    </div>
  );
}