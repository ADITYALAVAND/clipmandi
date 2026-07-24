const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";


// ======================================================
// LOGIN
// ======================================================

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  const data = await response.json();

  saveSession(data);

  return data;
}


// ======================================================
// REGISTER
// ======================================================

export async function register(email, password, displayName, role) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password,
      displayName,
      role
    })
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  const data = await response.json();

  saveSession(data);

  return data;
}


// ======================================================
// SAVE SESSION
// ======================================================

export function saveSession(data) {
  if (typeof window === "undefined") return;

  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  }

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  if (data.userId) {
    localStorage.setItem("userId", data.userId);
  }

  if (data.role) {
    localStorage.setItem("role", data.role);
  }

  if (data.displayName) {
    localStorage.setItem("displayName", data.displayName);
  }
}


// ======================================================
// GET ACCESS TOKEN
// ======================================================

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("accessToken");
}


// ======================================================
// GET REFRESH TOKEN
// ======================================================

export function getRefreshToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("refreshToken");
}


// ======================================================
// CHECK JWT EXPIRY
// ======================================================

export function isTokenExpired(token) {
  if (!token) {
    return true;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return true;
    }

    // JWT uses Base64URL, not normal Base64.
    let payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (payload.length % 4) {
      payload += "=";
    }

    const decoded = JSON.parse(atob(payload));

    if (!decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // Treat token as expired slightly early to avoid it expiring
    // while a request is being sent.
    return decoded.exp <= currentTime + 30;

  } catch (error) {
    console.error("Could not decode access token:", error);

    return true;
  }
}


// ======================================================
// REFRESH SESSION
// ======================================================

export async function refreshSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        refreshToken
      })
    });

    if (!response.ok) {
      logout();
      return null;
    }

    const data = await response.json();

    saveSession(data);

    return data.accessToken;

  } catch (error) {
    console.error("Token refresh failed:", error);

    logout();

    return null;
  }
}


// ======================================================
// GET VALID ACCESS TOKEN
// ======================================================

export async function getValidAccessToken() {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return null;
  }

  if (!isTokenExpired(accessToken)) {
    return accessToken;
  }

  // Access token expired → use refresh token
  return await refreshSession();
}


// ======================================================
// CURRENT USER
// ======================================================

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = getAccessToken();

  if (!accessToken) {
    return null;
  }

  return {
    userId: localStorage.getItem("userId"),
    displayName: localStorage.getItem("displayName"),
    role: localStorage.getItem("role")
  };
}


// ======================================================
// AUTHENTICATED?
// ======================================================

export function isAuthenticated() {
  return Boolean(getAccessToken());
}


// ======================================================
// LOGOUT
// ======================================================

export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("displayName");
}