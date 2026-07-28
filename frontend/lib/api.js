import { getValidAccessToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";


// ======================================================
// SAFE FETCH
// ======================================================

async function safeFetch(path, options = {}) {
  try {
    const token = await getValidAccessToken();

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    // ======================================================
    // HANDLE BACKEND ERRORS
    // ======================================================

    if (!res.ok) {
      let message = `Request failed: ${res.status}`;

      try {
        const errorBody = await res.json();

        if (errorBody?.message) {
          message = errorBody.message;
        }
      } catch {
        // Response wasn't JSON.
        // Keep the fallback message above.
      }

      console.error(`[api] ${path} failed:`, message);

      return {
        __error: true,
        status: res.status,
        message
      };
    }

    if (res.status === 204) {
      return {};
    }

    return await res.json();

  } catch (err) {
    console.error(`[api] ${path} failed:`, err.message);

    return {
      __error: true,
      status: 0,
      message:
        "Could not connect to the server. Please try again."
    };
  }
}

// ======================================================
// CAMPAIGNS
// ======================================================

export async function getCampaigns(params = {}) {
  const query = new URLSearchParams(params).toString();

  const data = await safeFetch(
    `/api/campaigns${query ? `?${query}` : ""}`
  );

  if (!data) return null;

  return (data.content || []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,

    cpm: Number(c.cpm),
    budgetTotal: Number(c.budgetTotal),
    budgetSpent: Number(c.budgetSpent),

    platforms: c.allowedPlatforms || [],
    allowedPlatforms: c.allowedPlatforms || [],

    status: c.status?.toLowerCase(),

    views: Number(c.views || 0),
    clipsCount: Number(c.clipsCount || 0),

    createdAt: c.createdAt
  }));
}


export function getCampaign(id) {
  return safeFetch(`/api/campaigns/${id}`);
}


export function createCampaign(data) {
  return safeFetch("/api/campaigns", {
    method: "POST",
    body: JSON.stringify(data)
  });



}
 // ======================================================
// CAMPAIGN PAYMENTS — CREATOR
// ======================================================

export function createCampaignPaymentOrder(campaignId) {
  return safeFetch(`/api/payments/campaigns/${campaignId}/order`, {
    method: "POST"
  });
}

export function verifyCampaignPayment(data) {
  return safeFetch("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify(data)
  });
}


// ======================================================
// CLIPS — CREATOR
// ======================================================

export function getClips() {
  return safeFetch("/api/clips");
}


export function approveClip(id) {
  return safeFetch(`/api/clips/${id}/approve`, {
    method: "PATCH"
  });
}


export function rejectClip(id) {
  return safeFetch(`/api/clips/${id}/reject`, {
    method: "PATCH"
  });
}


// Manual fallback.
// Normal YouTube verification is handled automatically
// by the backend scheduler.
export function syncYouTubeViews(id) {
  return safeFetch(`/api/clips/${id}/sync-youtube`, {
    method: "POST"
  });
}


// ======================================================
// CLIPS — CLIPPER
// ======================================================

export function getMyClips() {
  return safeFetch("/api/clips/mine");
}


export function submitClip(data) {
  return safeFetch("/api/clips", {
    method: "POST",
    body: JSON.stringify(data)
  });
}


// ======================================================
// WALLET
// ======================================================

export function getWallet() {
  return safeFetch("/api/wallet");
}


export function withdrawFromWallet(data) {
  return safeFetch("/api/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify(data)
  });
}