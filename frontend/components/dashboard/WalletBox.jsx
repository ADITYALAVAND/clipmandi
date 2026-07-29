"use client";

export default function WalletBox({ balance }) {
  const availableBalance = Number(balance || 0);

  return (
    <div className="wallet-box">

      <div className="lbl">
        Available balance
      </div>

      <div className="amt">
        ₹{availableBalance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "14px",
          borderRadius: "10px",
          background: "var(--bg-2)",
          border: "1px solid var(--border-soft)"
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "6px"
          }}
        >
          Withdraw earnings
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "var(--text-dim)",
            lineHeight: "1.6"
          }}
        >
          Withdrawals will be available once secure
          payouts are enabled on ClipMandi.
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        disabled
        style={{
          width: "100%",
          marginTop: "14px",
          opacity: 0.55,
          cursor: "not-allowed"
        }}
      >
        Withdraw
      </button>

    </div>
  );
}