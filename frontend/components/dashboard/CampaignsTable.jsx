const STATUS_LABEL = {
  live: "Live",
  budget_spent: "Budget spent",
  paused: "Paused"
};

export default function CampaignsTable({ campaigns }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Live campaigns</h3>
        <a className="link-small">View all →</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Budget spent</th>
            <th>Views</th>
            <th>Clips</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const pct = Math.min(100, Math.round((c.budgetSpent / c.budgetTotal) * 100));
            return (
              <tr key={c.id}>
                <td>
                  <div className="cell-main">
                    <div className="thumb"></div>
                    <div>
                      <div className="t-name">{c.name}</div>
                      <div className="t-sub">
                        CPM ₹{c.cpm} · {c.platforms.join(", ")}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="mono-cell">
                    ₹{c.budgetSpent.toLocaleString("en-IN")} / ₹{c.budgetTotal.toLocaleString("en-IN")}
                  </div>
                  <div className="bar-bg" style={{ marginTop: "6px" }}>
                    <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </td>
                <td className="mono-cell">{formatViews(c.views)}</td>
                <td className="mono-cell">{c.clipsCount}</td>
                <td>
                  <span className={`status ${c.status}`}>{STATUS_LABEL[c.status] || c.status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}
