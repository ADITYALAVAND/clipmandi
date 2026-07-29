"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";

import { getCampaigns } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function BrandPayoutsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState([]);
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
  // LOAD CAMPAIGNS
  // ======================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCampaigns();

      if (data?.__error || !data) {
        setError(
          data?.message ||
            "Payout data could not be loaded."
        );

        return;
      }

      setCampaigns(data);

    } catch (err) {
      console.error(
        "Failed to load payout data:",
        err
      );

      setError(
        "Payout data could not be loaded."
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
  // FINANCIAL CALCULATIONS
  // ======================================================

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

  const remainingBudget = Math.max(
    0,
    totalBudget - totalSpent
  );

  const utilization =
    totalBudget > 0
      ? Math.min(
          100,
          Math.round(
            (totalSpent / totalBudget) * 100
          )
        )
      : 0;

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
            <h1>Payments</h1>

            <div className="greet">
            Track campaign funding, spending and payment activity.
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
                : `₹${totalBudget.toLocaleString(
                    "en-IN"
                  )}`
            }
            label="Campaign budget"
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

          <KpiCard
            icon="₹"
            iconBg="var(--lime-soft)"
            value={
              loading
                ? "—"
                : `₹${remainingBudget.toLocaleString(
                    "en-IN"
                  )}`
            }
            label="Budget remaining"
          />

          <KpiCard
            icon="%"
            iconBg="var(--violet-soft)"
            value={
              loading
                ? "—"
                : `${utilization}%`
            }
            label="Budget utilized"
          />

        </div>

        {/* CAMPAIGN SPENDING */}

        {!loading && !error && (
          <div className="panel">

            <div className="panel-head">
              <div>
                <h3>Campaign spending</h3>

                <div
                  style={{
                    color: "var(--text-dim)",
                    fontSize: "12px",
                    marginTop: "4px"
                  }}
                >
                  Budget usage across your campaigns
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
                    <th>CPM</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>Usage</th>
                  </tr>
                </thead>

                <tbody>

                  {campaigns.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "28px 20px",
                          color:
                            "var(--text-faint)"
                        }}
                      >
                        No campaign spending yet.
                      </td>
                    </tr>
                  )}

                  {campaigns.map((campaign) => {

                    const budget = Number(
                      campaign.budgetTotal || 0
                    );

                    const spent = Number(
                      campaign.budgetSpent || 0
                    );

                    const remaining = Math.max(
                      0,
                      budget - spent
                    );

                    const percentage =
                      budget > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (spent / budget) *
                                100
                            )
                          )
                        : 0;

                    return (
                      <tr key={campaign.id}>

                        {/* CAMPAIGN */}

                        <td>
                          <div className="t-name">
                            {campaign.name ||
                              "Campaign"}
                          </div>
                        </td>

                        {/* CPM */}

                        <td className="mono-cell">
                          ₹
                          {Number(
                            campaign.cpm || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* BUDGET */}

                        <td className="mono-cell">
                          ₹
                          {budget.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* SPENT */}

                        <td className="mono-cell">
                          ₹
                          {spent.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* REMAINING */}

                        <td className="mono-cell">
                          ₹
                          {remaining.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* USAGE */}

                        <td
                          style={{
                            minWidth: "140px"
                          }}
                        >
                          <div
                            className="mono-cell"
                            style={{
                              marginBottom: "6px"
                            }}
                          >
                            {percentage}%
                          </div>

                          <div className="bar-bg">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${percentage}%`
                              }}
                            />
                          </div>
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