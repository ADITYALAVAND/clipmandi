"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/components/dashboard/Sidebar";
import CustomSelect from "@/components/ui/CustomSelect";
import { getCampaign, submitClip } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

import styles from "./page.module.css";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState({
    displayName: "",
    role: ""
  });

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [platform, setPlatform] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // ======================================================
  // AUTH
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
      displayName: currentUser.displayName || "Clipper",
      role: currentUser.role
    });

    setAuthChecked(true);
  }, [router]);

  // ======================================================
  // LOAD CAMPAIGN
  // ======================================================

  useEffect(() => {
    if (!authChecked || !campaignId) return;

    async function loadCampaign() {
      setLoading(true);
      setError("");

      const data = await getCampaign(campaignId);

     if (data?.__error) {
  setError(
    data.message ||
      "Campaign could not be loaded."
  );
  setLoading(false);
  return;
}

if (!data) {
  setError("Campaign could not be loaded.");
  setLoading(false);
  return;
}

      setCampaign(data);

      if (data.allowedPlatforms?.length > 0) {
        setPlatform(data.allowedPlatforms[0]);
      }

      setLoading(false);
    }

    loadCampaign();
  }, [authChecked, campaignId]);

  // ======================================================
  // SUBMIT CLIP
  // ======================================================

  async function handleSubmitClip(e) {
  e.preventDefault();

  setSubmitError("");
  setSubmitSuccess("");

  if (!platform) {
    setSubmitError("Please choose a platform.");
    return;
  }

  if (!contentUrl.trim()) {
    setSubmitError("Please paste your published clip URL.");
    return;
  }

  try {
    new URL(contentUrl.trim());
  } catch {
    setSubmitError("Please enter a valid URL.");
    return;
  }

  setSubmitting(true);

  const result = await submitClip({
    campaignId,
    platform,
    contentUrl: contentUrl.trim()
  });

  setSubmitting(false);

  if (result?.__error) {
    setSubmitError(
      result.message ||
        "Clip could not be submitted. Please try again."
    );
    return;
  }

  if (!result) {
    setSubmitError(
      "Clip could not be submitted. Please try again."
    );
    return;
  }

  setSubmitSuccess(
    "Clip submitted successfully! It is now pending creator review."
  );

  setContentUrl("");
}

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="dash">
        <Sidebar
          role="clipper"
          userName={user.displayName}
          userRole="Clipper account"
        />

        <main className={`main ${styles.center}`}>
          <p className={styles.muted}>Loading campaign...</p>
        </main>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error || !campaign) {
    return (
      <div className="dash">
        <Sidebar
          role="clipper"
          userName={user.displayName}
          userRole="Clipper account"
        />

        <main className="main">
          <Link href="/clipper" className="link-small">
            ← Back to campaigns
          </Link>

          <div className={`panel ${styles.errorPanel}`}>
            <h2>Campaign unavailable</h2>
            <p className={styles.muted}>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // CAMPAIGN VALUES
  // ======================================================

  const cpm = Number(campaign.cpm || 0);
  const budgetTotal = Number(campaign.budgetTotal || 0);
  const budgetSpent = Number(campaign.budgetSpent || 0);

  const budgetLeft = Math.max(
    0,
    budgetTotal - budgetSpent
  );

  const spentPercentage =
    budgetTotal > 0
      ? Math.min(
          100,
          Math.round((budgetSpent / budgetTotal) * 100)
        )
      : 0;

  return (
    <div className="dash">
      <Sidebar
        role="clipper"
        userName={user.displayName}
        userRole="Clipper account"
      />

      <main className="main">

        <Link
          href="/clipper"
          className={`link-small ${styles.backLink}`}
        >
          ← Back to campaigns
        </Link>

        {/* HERO */}

        <section className={`panel ${styles.hero}`}>
          <div className={styles.heroLayout}>

            <div className={styles.heroContent}>
              <div className={styles.tags}>
                <span className="status live">
                  LIVE
                </span>

                <span className={styles.category}>
                  {campaign.category || "General"}
                </span>
              </div>

              <h1 className={styles.title}>
                {campaign.name}
              </h1>

              <p className={styles.description}>
                {campaign.description ||
                  "No campaign description provided."}
              </p>
            </div>

            <div className={styles.earnBox}>
              <span className={styles.eyebrow}>
                EARN
              </span>

              <strong className={styles.cpm}>
                ₹{cpm.toLocaleString("en-IN")}
              </strong>

              <span className={styles.cpmDescription}>
                per 1,000 verified views
              </span>
            </div>

          </div>
        </section>

        {/* INFO CARDS */}

        <section className={styles.infoGrid}>
          <InfoCard
            label="CPM"
            value={`₹${cpm.toLocaleString("en-IN")}`}
          />

          <InfoCard
            label="Budget left"
            value={`₹${budgetLeft.toLocaleString("en-IN")}`}
          />

          <InfoCard
            label="Total budget"
            value={`₹${budgetTotal.toLocaleString("en-IN")}`}
          />

          <InfoCard
            label="Category"
            value={campaign.category || "General"}
          />
        </section>

        {/* BUDGET */}

        <section className={`panel ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h3>Campaign budget</h3>

            <span className={styles.mutedSmall}>
              ₹{budgetSpent.toLocaleString("en-IN")} spent
            </span>
          </div>

          <div className="bar-bg">
            <div
              className="bar-fill"
              style={{
                width: `${spentPercentage}%`
              }}
            />
          </div>
        </section>

        {/* PLATFORMS */}

        <section className={`panel ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            Allowed platforms
          </h3>

          <div className={styles.platforms}>
            {(campaign.allowedPlatforms || []).map(
              (item) => (
                <span
                  key={item}
                  className={styles.platformBadge}
                >
                  {formatPlatform(item)}
                </span>
              )
            )}
          </div>
        </section>

        {/* RULES */}

        <section className={`panel ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            Campaign rules
          </h3>

          <p className={styles.rules}>
            {campaign.rules ||
              "No additional campaign rules provided."}
          </p>
        </section>

        {/* SUBMIT CLIP */}

        <section className={`panel ${styles.submitPanel}`}>

          <div className={styles.submitHeader}>
            <div>
              <h3>Ready to clip?</h3>

              <p>
                Publish your content on an allowed platform,
                then submit the link for review.
              </p>
            </div>

            {!showSubmitForm && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowSubmitForm(true);
                  setSubmitError("");
                  setSubmitSuccess("");
                }}
              >
                Submit a clip →
              </button>
            )}
          </div>

          {showSubmitForm && (
            <form
              onSubmit={handleSubmitClip}
              className={styles.submitForm}
            >

              <CustomSelect
                options={campaign.allowedPlatforms || []}
                value={platform}
                onChange={setPlatform}
                label="Platform"
              />

              <div className={styles.field}>
                <label htmlFor="contentUrl">
                  Published clip URL
                </label>

                <input
                  id="contentUrl"
                  type="url"
                  value={contentUrl}
                  onChange={(e) =>
                    setContentUrl(e.target.value)
                  }
                  placeholder="https://instagram.com/reel/..."
                  required
                  className={styles.input}
                />
              </div>

              {submitError && (
                <div className={styles.submitError}>
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className={styles.submitSuccess}>
                  ✓ {submitSuccess}
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit for review"}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={submitting}
                  onClick={() => {
                    setShowSubmitForm(false);
                    setSubmitError("");
                    setSubmitSuccess("");
                  }}
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

        </section>

      </main>
    </div>
  );
}

// ======================================================
// INFO CARD
// ======================================================

function InfoCard({ label, value }) {
  return (
    <div className={`panel ${styles.infoCard}`}>
      <span>{label.toUpperCase()}</span>
      <strong>{value}</strong>
    </div>
  );
}

// ======================================================
// PLATFORM DISPLAY
// ======================================================

function formatPlatform(platform) {
  switch (platform) {
    case "INSTAGRAM":
      return "Instagram";

    case "YOUTUBE":
      return "YouTube";

    case "TIKTOK":
      return "TikTok";

    default:
      return platform;
  }
}