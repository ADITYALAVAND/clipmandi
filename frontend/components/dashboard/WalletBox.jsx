"use client";

import { useState } from "react";
import { withdrawFromWallet } from "@/lib/api";

export default function WalletBox({ balance, onUpdated }) {
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleWithdraw() {
  if (!upiId || !amount) return;

  setSubmitting(true);

  const result = await withdrawFromWallet({
    amount: Number(amount),
    upiId
  });

  setSubmitting(false);

  if (result?.__error || !result) {
    alert(
      result?.message ||
        "Withdrawal could not be completed."
    );
    return;
  }

  setAmount("");
  onUpdated?.();
}

  return (
    <div className="wallet-box">
      <div className="lbl">Wallet balance</div>
      <div className="amt">₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
      <div className="input-row" style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="input-row">
        <input
          type="text"
          placeholder="yourname@upi"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />
        <a className="btn btn-primary" onClick={handleWithdraw}>
          {submitting ? "Sending…" : "Withdraw"}
        </a>
      </div>
    </div>
  );
}
