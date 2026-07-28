const STATUS_LABEL = {
  live: "Live",
  pending_funding: "Pending funding",
  budget_spent: "Budget spent",
  paused: "Paused",
  draft: "Draft",
  closed: "Closed"
};

export default function CampaignsTable({
  campaigns = [],
  onFund,
  fundingId
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Campaigns</h3>

        <span className="link-small">
          {campaigns.length} total
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Budget spent</th>
              <th>Views</th>
              <th>Clips</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    color: "var(--text-faint)",
                    padding: "28px 20px"
                  }}
                >
                  No campaigns yet.
                </td>
              </tr>
            )}

            {campaigns.map((c) => {
              const budgetSpent = Number(
                c.budgetSpent || 0
              );

              const budgetTotal = Number(
                c.budgetTotal || 0
              );

              const pct =
                budgetTotal > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (budgetSpent / budgetTotal) *
                          100
                      )
                    )
                  : 0;

              const isPendingFunding =
                c.status === "pending_funding";

              const isFunding =
                fundingId === c.id;

              return (
                <tr key={c.id}>
                  <td>
                    <div className="cell-main">
                      <div className="thumb"></div>

                      <div>
                        <div className="t-name">
                          {c.name}
                        </div>

                        <div className="t-sub">
                          CPM ₹
                          {Number(
                            c.cpm || 0
                          ).toLocaleString("en-IN")}
                          {" · "}
                          {(c.platforms || []).join(
                            ", "
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="mono-cell">
                      ₹
                      {budgetSpent.toLocaleString(
                        "en-IN"
                      )}{" "}
                      / ₹
                      {budgetTotal.toLocaleString(
                        "en-IN"
                      )}
                    </div>

                    <div
                      className="bar-bg"
                      style={{
                        marginTop: "6px"
                      }}
                    >
                      <div
                        className="bar-fill"
                        style={{
                          width: `${pct}%`
                        }}
                      />
                    </div>
                  </td>

                  <td className="mono-cell">
                    {formatViews(c.views)}
                  </td>

                  <td className="mono-cell">
                    {Number(c.clipsCount || 0)}
                  </td>

                  <td>
                    <span
                      className={`status ${c.status}`}
                    >
                      {STATUS_LABEL[c.status] ||
                        c.status}
                    </span>
                  </td>

                  <td>
                    {isPendingFunding ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={isFunding}
                        onClick={() => {
  console.log("REACT FUND BUTTON CLICK", c.id);
  onFund(c.id);
}}
                        style={{
                          padding: "7px 12px",
                          fontSize: "12px"
                        }}
                      >
                        {isFunding
                          ? "Funding..."
                          : "Fund campaign"}
                      </button>
                    ) : (
                      <span
                        style={{
                          color:
                            "var(--text-faint)"
                        }}
                      >
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatViews(n) {
  const views = Number(n || 0);

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(
      1
    )}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K`;
  }

  return String(views);
}