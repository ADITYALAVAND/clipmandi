"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";
import CampaignGrid from "@/components/dashboard/CampaignGrid";
import MyClipsTable from "@/components/dashboard/MyClipsTable";
import WalletBox from "@/components/dashboard/WalletBox";

import {
  getCampaigns,
  getMyClips,
  getWallet
} from "@/lib/api";

import { getCurrentUser } from "@/lib/auth";

export default function ClipperDashboard() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState([]);
  const [clips, setClips] = useState([]);
  const [category, setCategory] = useState("ALL");

  // ======================================================
  // REAL WALLET STATE
  // ======================================================

  const [wallet, setWallet] = useState({
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    transactions: []
  });

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
  // LOAD REAL DASHBOARD DATA
  // ======================================================

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        campaignData,
        clipData,
        walletData
      ] = await Promise.all([
      getCampaigns({
  status: "LIVE",
  ...(category !== "ALL"
    ? { category }
    : {})
}),
        getMyClips(),
        getWallet()
      ]);

     // Real campaigns
setCampaigns(
  campaignData?.__error
    ? []
    : campaignData || []
);

// Real clipper submissions
setClips(
  clipData?.__error
    ? []
    : clipData || []
);

// Real wallet
setWallet(
  walletData?.__error
    ? {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        transactions: []
      }
    : walletData || {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        transactions: []
      }
);
    } catch (error) {
      console.error(
        "Failed to load clipper dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [category]);

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
  // DASHBOARD STATS
  // ======================================================

  const pendingCount = clips.filter(
    (clip) =>
      clip.status?.toUpperCase() === "PENDING"
  ).length;

  const totalViews = clips.reduce(
    (sum, clip) =>
      sum + Number(clip.views || 0),
    0
  );

  // ======================================================
  // DASHBOARD
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
            <h1>Browse campaigns</h1>

            <div className="greet">
              {loading
                ? "Loading the floor…"
                : `${campaigns.length} campaigns live right now.`}
            </div>
          </div>

         <select
  value={category}
  onChange={(e) =>
    setCategory(e.target.value)
  }
  className="btn btn-ghost"
  style={{
    cursor: "pointer"
  }}
>
  <option value="ALL">
    All niches
  </option>

  <option value="Music">
    Music
  </option>

  <option value="Fashion">
    Fashion
  </option>

  <option value="Fitness">
    Fitness
  </option>

  <option value="Gaming">
    Gaming
  </option>

  <option value="Technology">
    Technology
  </option>

  <option value="Food">
    Food
  </option>
</select>
        </div>

        {/* KPI CARDS */}

        <div className="cards-row">

          {/* REAL TOTAL EARNINGS */}

          <KpiCard
            icon="₹"
            iconBg="var(--violet-soft)"
            value={`₹${Number(
              wallet.totalEarned || 0
            ).toLocaleString("en-IN")}`}
            label="Total earned"
          />

          {/* PENDING CLIPS */}

          <KpiCard
            icon="⧗"
            iconBg="var(--lime-soft)"
            value={pendingCount}
            label="Pending review"
          />

          {/* TOTAL CLIPS */}

          <KpiCard
            icon="✎"
            iconBg="var(--pink-soft)"
            value={clips.length}
            label="Clips posted total"
          />

          {/* VERIFIED VIEWS */}

          <KpiCard
            icon="▶"
            iconBg="var(--lime-soft)"
            value={formatViews(totalViews)}
            label="Lifetime verified views"
          />

        </div>

        {/* LIVE CAMPAIGNS */}

        <CampaignGrid
          campaigns={campaigns}
        />

        {/* CLIPS + WALLET */}

        <div
          className="grid-2"
          style={{
            marginTop: "8px"
          }}
        >

          {/* REAL CLIPS */}

          <MyClipsTable
            clips={clips}
          />

          <div>

            {/* REAL WALLET BALANCE */}

            <WalletBox
              balance={Number(
                wallet.balance || 0
              )}
              onUpdated={loadData}
            />

            {/* REAL TRANSACTIONS */}

            <div
              className="panel"
              style={{
                padding: "20px"
              }}
            >
              <h3
                style={{
                  marginBottom: "14px"
                }}
              >
                Recent transactions
              </h3>

              {(!wallet.transactions ||
                wallet.transactions.length === 0) && (
                <div
                  style={{
                    color: "var(--text-faint)",
                    fontSize: "13px",
                    padding: "12px 0"
                  }}
                >
                  No transactions yet.
                </div>
              )}

              {(wallet.transactions || [])
                .slice(0, 4)
                .map((transaction) => {

                  const amount = Number(
                    transaction.amount || 0
                  );

                  return (
                    <div
                      key={transaction.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "15px",
                        fontSize: "13px",
                        padding: "10px 0",
                        borderTop:
                          "1px solid var(--border-soft)"
                      }}
                    >
                      <span
                        style={{
                          color:
                            "var(--text-dim)"
                        }}
                      >
                        {transaction.note ||
                          "Wallet transaction"}
                      </span>

                      <span
                        className="mono-cell"
                        style={{
                          color:
                            amount > 0
                              ? "var(--green)"
                              : "var(--text)"
                        }}
                      >
                        {amount > 0 ? "+" : ""}

                        ₹{amount.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  );
                })}

            </div>

          </div>

        </div>

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