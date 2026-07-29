import Link from "next/link";

export default function CampaignGrid({ campaigns }) {
  const sortedCampaigns = [...campaigns].sort(
    (a, b) =>
      Number(b.cpm || 0) - Number(a.cpm || 0)
  );
  return (
    <div
      className="panel"
      style={{
        background: "transparent",
        border: "none"
      }}
    >
      <div
        className="panel-head"
        style={{
          paddingLeft: 0,
          paddingRight: 0
        }}
      >
        <h3>Open campaigns</h3>

        <span className="link-small">
        Highest CPM first
        </span>
      </div>

      <div className="camp-grid">
        {campaigns.length === 0 && (
          <div
            className="panel"
            style={{
              padding: "24px",
              color: "var(--text-dim)"
            }}
          >
            No live campaigns available right now.
          </div>
        )}

        {sortedCampaigns.map((c) => {
          const budgetLeft =
            Number(c.budgetTotal || 0) -
            Number(c.budgetSpent || 0);

          return (
            <div
              className="camp-card"
              key={c.id}
            >
              <div className="cthumb">
                {getCategoryIcon(c.category)}
              </div>

              <h4>{c.name}</h4>

              <div className="desc">
                {c.category || "General"}
              </div>

              <div className="camp-meta">
                <span className="cpm">
                  ₹{Number(c.cpm).toLocaleString("en-IN")} CPM
                </span>

                <span>
                  ₹{formatMoney(budgetLeft)} left
                </span>
              </div>

              <Link
                href={`/clipper/campaigns/${c.id}`}
                className="btn btn-primary"
              >
                View campaign
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatMoney(n) {
  if (n >= 100000) {
    return `${(n / 100000).toFixed(1)}L`;
  }

  if (n >= 1000) {
    return `${(n / 1000).toFixed(
      n % 1000 === 0 ? 0 : 1
    )}K`;
  }

  return Number(n).toLocaleString("en-IN");
}

function getCategoryIcon(category) {
  switch (category?.toLowerCase()) {
    case "music":
      return "♫";

    case "gaming":
      return "◈";

    case "fitness":
      return "✦";

    case "fashion":
      return "◆";

    case "technology":
      return "⌘";

    case "food":
      return "◉";

    case "entertainment":
      return "▶";

    default:
      return "CM";
  }
}