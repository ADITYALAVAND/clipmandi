"use client";

import RoleGuard from "@/components/auth/RoleGuard";

export default function BrandLayout({
  children
}) {
  return (
    <RoleGuard requiredRole="CREATOR">
      {children}
    </RoleGuard>
  );
}