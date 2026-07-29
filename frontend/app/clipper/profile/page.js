"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useRouter
} from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";

import {
  getCurrentUser,
  logout
} from "@/lib/auth";

export default function ClipperProfilePage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] =
    useState(false);

  const [user, setUser] = useState({
    userId: "",
    displayName: "",
    role: ""
  });

  // ======================================================
  // AUTHENTICATION
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
      userId: currentUser.userId || "",
      displayName:
        currentUser.displayName || "Clipper",
      role: currentUser.role || "CLIPPER"
    });

    setAuthChecked(true);
  }, [router]);

  // ======================================================
  // LOGOUT
  // ======================================================

  function handleLogout() {
  logout();
  router.replace("/");
  router.refresh();
}

  // ======================================================
  // AUTH LOADING
  // ======================================================

  if (!authChecked) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <p
          style={{
            color: "var(--text-dim)"
          }}
        >
          Checking session...
        </p>
      </main>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="dash">

      <Sidebar
        role="clipper"
        userName={user.displayName}
        userRole="Clipper account"
      />

      <main className="main">

        {/* HEADER */}

        <div className="dash-header">
          <div>
            <h1>Profile</h1>

            <div className="greet">
              View your ClipMandi account
              information.
            </div>
          </div>
        </div>

        {/* PROFILE */}

        <div
          className="panel"
          style={{
            padding: "24px",
            maxWidth: "760px"
          }}
        >

          {/* PROFILE HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingBottom: "24px",
              borderBottom:
                "1px solid var(--border-soft)"
            }}
          >
            <div
              className="avatar"
              style={{
                width: "56px",
                height: "56px",
                flexShrink: 0
              }}
            />

            <div>
              <h2
                style={{
                  margin: 0
                }}
              >
                {user.displayName}
              </h2>

              <div
                style={{
                  color: "var(--text-dim)",
                  fontSize: "13px",
                  marginTop: "5px"
                }}
              >
                Clipper account
              </div>
            </div>
          </div>

          {/* ACCOUNT DETAILS */}

          <div
            style={{
              paddingTop: "24px"
            }}
          >
            <h3
              style={{
                marginBottom: "20px"
              }}
            >
              Account details
            </h3>

            <ProfileRow
              label="Display name"
              value={user.displayName}
            />

            <ProfileRow
              label="Account type"
              value="Clipper"
            />

            <ProfileRow
              label="User ID"
              value={user.userId || "—"}
              mono
            />

            <ProfileRow
              label="Account status"
              value="Active"
            />
          </div>

          {/* ACTIONS */}

          <div
            style={{
              marginTop: "28px",
              paddingTop: "20px",
              borderTop:
                "1px solid var(--border-soft)"
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}


// ======================================================
// PROFILE ROW
// ======================================================

function ProfileRow({
  label,
  value,
  mono = false
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        padding: "15px 0",
        borderBottom:
          "1px solid var(--border-soft)"
      }}
    >
      <span
        style={{
          color: "var(--text-dim)",
          fontSize: "13px"
        }}
      >
        {label}
      </span>

      <span
        className={
          mono ? "mono-cell" : undefined
        }
        style={{
          fontSize: "13px",
          textAlign: "right",
          wordBreak: "break-word"
        }}
      >
        {value}
      </span>
    </div>
  );
}