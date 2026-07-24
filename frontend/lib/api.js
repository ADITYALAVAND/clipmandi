import { getValidAccessToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";


// ======================================================
// SAFE FETCH
// ======================================================

async function safeFetch(path, options = {}) {
  try {
    // Gets existing token OR automatically refreshes it
    // if it is expired.
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

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    if (res.status === 204) {
      return {};
    }

    return await res.json();

  } catch (err) {
    console.error(`[api] ${path} failed:`, err.message);
    return null;
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

    // These will become real aggregated values later.
    views: 0,
    clipsCount: 0,

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
// CLIPS — CREATOR
// ======================================================

// Returns every clip submitted to campaigns owned
// by the currently logged-in Creator.
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

export function updateClipViews(id, views) {
  return safeFetch(`/api/clips/${id}/views`, {
    method: "PATCH",
    body: JSON.stringify({
      views: Number(views)
    })
  });
}

// ======================================================
// CLIPS — CLIPPER
// ======================================================

// Returns submissions belonging only to the
// currently logged-in Clipper.
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