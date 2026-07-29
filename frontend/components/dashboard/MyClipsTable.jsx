"use client";
import Link from "next/link";

const STATUS_CONFIG = {
  PENDING: {
    label: "In review",
    className: "review"
  },

  APPROVED: {
    label: "Approved",
    className: "live"
  },

  REJECTED: {
    label: "Rejected",
    className: "rejected"
  }
};

export default function MyClipsTable({
  clips = [],
  showViewAll = true
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>My recent clips</h3>

          <div
            style={{
              color: "var(--text-dim)",
              fontSize: "12px",
              marginTop: "4px"
            }}
          >
            {clips.length} submission{clips.length === 1 ? "" : "s"}
          </div>
        </div>

        {showViewAll && (
            <Link
              href="/clipper/my-clips"
              className="link-small"
            >
              View all →
            </Link>
          )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Clip</th>
              <th>Platform</th>
              <th>Views</th>
              <th>Earned</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {clips.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    color: "var(--text-faint)",
                    padding: "28px 20px"
                  }}
                >
                  You haven't submitted any clips yet.
                </td>
              </tr>
            )}

            {clips.map((clip) => {
              const status =
                clip.status?.toUpperCase() || "PENDING";

              const statusConfig =
                STATUS_CONFIG[status] || {
                  label: status,
                  className: "review"
                };

              const earnings =
                Number(
                  clip.earnings ??
                  clip.earningsPaise / 100 ??
                  0
                ) || 0;

              return (
                <tr key={clip.id}>

                  {/* CAMPAIGN */}

                  <td>
                    <div className="cell-main">

                      <div className="thumb"></div>

                      <div>
                        <div className="t-name">
                          {clip.campaignName || "Campaign"}
                        </div>

                        {clip.campaignId && (
                          <div className="t-sub">
                            {shortId(clip.campaignId)}
                          </div>
                        )}
                      </div>

                    </div>
                  </td>

                  {/* PLATFORM */}

                  <td>
                    <span
                      style={{
                        padding: "5px 9px",
                        borderRadius: "100px",
                        background: "var(--violet-soft)",
                        color: "var(--violet-bright)",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}
                    >
                      {formatPlatform(clip.platform)}
                    </span>
                  </td>

                  {/* VIEWS */}

                  <td className="mono-cell">
                    {Number(clip.views || 0).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  {/* EARNINGS */}

                  <td className="mono-cell">
                    ₹{earnings.toLocaleString("en-IN")}
                  </td>

                  {/* STATUS */}

                  <td>
                    <span
                      className={`status ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </td>

                  {/* URL */}

                  <td>
                    {clip.contentUrl ? (
                      <a
                        href={clip.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-small"
                      >
                        Open ↗
                      </a>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-faint)"
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

function formatPlatform(platform) {
  switch (platform?.toUpperCase()) {
    case "INSTAGRAM":
      return "Instagram";

    case "YOUTUBE":
      return "YouTube";

    case "TIKTOK":
      return "TikTok";

    default:
      return platform || "Unknown";
  }
}

function shortId(id) {
  if (!id) return "";

  const value = String(id);

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...`;
}