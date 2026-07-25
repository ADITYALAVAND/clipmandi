"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";
import KpiCard from "@/components/dashboard/KpiCard";
import WalletBox from "@/components/dashboard/WalletBox";

import { getWallet } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export default function ClipperWalletPage() {
  const router = useRouter();

  // ======================================================
  // STATE
  // ======================================================

  const [wallet, setWallet] = useState({
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    transactions: []
  });

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
  // LOAD WALLET
  // ======================================================

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const walletData = await getWallet();

      if (
        walletData?.__error ||
        !walletData
      ) {
        setError(
          walletData?.message ||
            "Wallet could not be loaded."
        );

        return;
      }

      setWallet({
        balance: Number(
          walletData.balance || 0
        ),

        totalEarned: Number(
          walletData.totalEarned || 0
        ),

        totalWithdrawn: Number(
          walletData.totalWithdrawn || 0
        ),

        transactions:
          walletData.transactions || []
      });
    } catch (err) {
      console.error(
        "Failed to load wallet:",
        err
      );

      setError(
        "Wallet could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authChecked) {
      loadWallet();
    }
  }, [authChecked, loadWallet]);

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
  // WALLET PAGE
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
            <h1>Wallet</h1>

            <div className="greet">
              Manage your ClipMandi earnings
              and withdrawals.
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
                    wallet.balance || 0
                  ).toLocaleString("en-IN")}`
            }
            label="Available balance"
          />

          <KpiCard
            icon="↑"
            iconBg="var(--lime-soft)"
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
            icon="↗"
            iconBg="var(--pink-soft)"
            value={
              loading
                ? "—"
                : `₹${Number(
                    wallet.totalWithdrawn || 0
                  ).toLocaleString("en-IN")}`
            }
            label="Total withdrawn"
          />

        </div>

        {/* WALLET CONTENT */}

        {!loading && !error && (
          <div
            className="grid-2"
            style={{
              marginTop: "8px"
            }}
          >

            {/* WITHDRAW */}

            <WalletBox
              balance={Number(
                wallet.balance || 0
              )}
              onUpdated={loadWallet}
            />

            {/* TRANSACTIONS */}

            <div
              className="panel"
              style={{
                padding: "20px"
              }}
            >
              <h3
                style={{
                  marginBottom: "6px"
                }}
              >
                Recent transactions
              </h3>

              <div
                style={{
                  color: "var(--text-faint)",
                  fontSize: "13px",
                  marginBottom: "16px"
                }}
              >
                Your latest wallet activity.
              </div>

              {(!wallet.transactions ||
                wallet.transactions.length ===
                  0) && (
                <div
                  style={{
                    color:
                      "var(--text-faint)",
                    fontSize: "13px",
                    padding: "20px 0"
                  }}
                >
                  No transactions yet.
                </div>
              )}

              {(wallet.transactions || [])
                .slice(0, 8)
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

                        padding: "13px 0",

                        borderTop:
                          "1px solid var(--border-soft)"
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            color:
                              "var(--text-dim)"
                          }}
                        >
                          {transaction.note ||
                            "Wallet transaction"}
                        </div>

                        {transaction.createdAt && (
                          <div
                            style={{
                              fontSize: "11px",
                              color:
                                "var(--text-faint)",
                              marginTop: "4px"
                            }}
                          >
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                        )}
                      </div>

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

                        ₹
                        {Math.abs(
                          amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}