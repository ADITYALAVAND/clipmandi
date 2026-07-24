"use client";

import { useState } from "react";

import {
  approveClip,
  rejectClip,
  syncYouTubeViews
} from "@/lib/api";

export default function ClipInboxTable({
  clips = [],
  onUpdated
}) {

  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // APPROVE
  // ======================================================

  async function handleApprove(id) {
    setError("");
    setSuccess("");
    setProcessingId(id);

    const result = await approveClip(id);

    if (!result) {
      setError("Could not approve this clip.");
      setProcessingId(null);
      return;
    }

    setSuccess("Clip approved successfully.");

    await onUpdated?.();

    setProcessingId(null);
  }

  // ======================================================
  // REJECT
  // ======================================================

  async function handleReject(id) {
    setError("");
    setSuccess("");
    setProcessingId(id);

    const result = await rejectClip(id);

    if (!result) {
      setError("Could not reject this clip.");
      setProcessingId(null);
      return;
    }

    setSuccess("Clip rejected.");

    await onUpdated?.();

    setProcessingId(null);
  }

  // ======================================================
  // YOUTUBE MANUAL SYNC FALLBACK
  // ======================================================

  async function handleYouTubeSync(clip) {
    setError("");
    setSuccess("");
    setProcessingId(clip.id);

    const result = await syncYouTubeViews(
      clip.id
    );

    if (!result) {
      setError(
        "Could not sync views from YouTube."
      );

      setProcessingId(null);
      return;
    }

    setSuccess(
      `YouTube synced successfully — ${Number(
        result.views || 0
      ).toLocaleString(
        "en-IN"
      )} verified views and ₹${Number(
        result.earnings || 0
      ).toLocaleString(
        "en-IN"
      )} total earnings.`
    );

    await onUpdated?.();

    setProcessingId(null);
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="panel">

      <div className="panel-head">
        <div>

          <h3>Clip inbox</h3>

          <div
            style={{
              color: "var(--text-dim)",
              fontSize: "12px",
              marginTop: "4px"
            }}
          >
            {clips.length} total submission
            {clips.length === 1 ? "" : "s"}
          </div>

        </div>
      </div>


      {error && (
        <div
          style={{
            margin: "0 20px 16px",
            padding: "11px 14px",
            borderRadius: "10px",
            background: "rgba(255,80,80,0.08)",
            color: "#ff6b6b",
            fontSize: "13px"
          }}
        >
          {error}
        </div>
      )}


      {success && (
        <div
          style={{
            margin: "0 20px 16px",
            padding: "11px 14px",
            borderRadius: "10px",
            background: "rgba(50,220,120,0.08)",
            color: "#45e58c",
            fontSize: "13px"
          }}
        >
          {success}
        </div>
      )}


      <div style={{ overflowX: "auto" }}>

        <table>

          <thead>
            <tr>
              <th>Clipper</th>
              <th>Platform</th>
              <th>Clip</th>
              <th>Views</th>
              <th>Earned</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>


          <tbody>

            {clips.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    color: "var(--text-faint)",
                    padding: "28px 20px"
                  }}
                >
                  No clip submissions yet.
                </td>
              </tr>
            )}


            {clips.map((clip) => {

              const status =
                clip.status?.toUpperCase();

              const platform =
                clip.platform?.toUpperCase();

              const isYouTube =
                platform === "YOUTUBE";

              const processing =
                processingId === clip.id;

              return (
                <tr key={clip.id}>

                  <td>

                    <div className="cell-main">

                      <div className="thumb"></div>

                      <div>

                        <div className="t-name">
                          {clip.clipperName ||
                            clip.clipper ||
                            "Clipper"}
                        </div>

                        <div
                          style={{
                            color: "var(--text-faint)",
                            fontSize: "10px"
                          }}
                        >
                          {shortId(
                            clip.clipperId
                          )}
                        </div>

                      </div>

                    </div>

                  </td>


                  <td>
                    {formatPlatform(
                      clip.platform
                    )}
                  </td>


                  <td>

                    {clip.contentUrl ? (
                      <a
                        href={clip.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-small"
                      >
                        View clip ↗
                      </a>
                    ) : (
                      "—"
                    )}

                  </td>


                  <td className="mono-cell">
                    {Number(
                      clip.views || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>


                  <td className="mono-cell">
                    ₹
                    {Number(
                      clip.earnings || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>


                  <td>
                    <StatusBadge
                      status={status}
                    />
                  </td>


                  <td>

                    {status === "PENDING" && (

                      <div
                        style={{
                          display: "flex",
                          gap: "8px"
                        }}
                      >

                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={processing}
                          onClick={() =>
                            handleApprove(
                              clip.id
                            )
                          }
                        >
                          {processing
                            ? "Working..."
                            : "Approve"}
                        </button>


                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={processing}
                          onClick={() =>
                            handleReject(
                              clip.id
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>
                    )}


                    {status === "APPROVED" && (

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          flexWrap: "wrap"
                        }}
                      >

                        {isYouTube ? (

                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={processing}
                            onClick={() =>
                              handleYouTubeSync(
                                clip
                              )
                            }
                            style={{
                              padding: "8px 12px",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {processing
                              ? "Syncing..."
                              : "Sync YouTube"}
                          </button>

                        ) : (

                          <span
                            style={{
                              color: "var(--text-faint)",
                              fontSize: "12px"
                            }}
                          >
                            Auto verification unavailable
                          </span>

                        )}

                      </div>
                    )}


                    {status === "REJECTED" && (

                      <span
                        style={{
                          color:
                            "var(--text-faint)",
                          fontSize: "12px"
                        }}
                      >
                        No action
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


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }) {

  const styles = {

    PENDING: {
      background:
        "rgba(255,201,60,0.10)",
      color: "#ffc93c"
    },

    APPROVED: {
      background:
        "rgba(50,220,120,0.10)",
      color: "#45e58c"
    },

    REJECTED: {
      background:
        "rgba(255,80,80,0.10)",
      color: "#ff6b6b"
    }

  };

  const style =
    styles[status] || {
      background: "var(--violet-soft)",
      color: "var(--text-dim)"
    };

  return (
    <span
      style={{
        padding: "5px 9px",
        borderRadius: "100px",
        fontSize: "11px",
        fontWeight: "600",
        ...style
      }}
    >
      {status || "UNKNOWN"}
    </span>
  );
}


// ======================================================
// PLATFORM
// ======================================================

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


// ======================================================
// SHORT ID
// ======================================================

function shortId(id) {

  if (!id) return "";

  const value = String(id);

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...`;
}