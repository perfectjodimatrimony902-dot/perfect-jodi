"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { syncAllProfilesFromDb, syncMongoSession } from "@/lib/actions";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // 1. Sync live approved profiles from MongoDB Atlas
    syncAllProfilesFromDb();

    // 2. Refresh session if user has a stored token
    const token = typeof window !== "undefined" ? localStorage.getItem("pj_jwt_token") : null;
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.user) {
            syncMongoSession(data.user, data.profile, token);
          }
        })
        .catch((err) => console.error("Session sync error:", err));
    }
  }, []);

  return (
    <>
      {!isAdmin && <SiteHeader />}
      <main className="min-h-[calc(100vh-16rem)]">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      {!isAdmin && <SiteFooter />}
      <Toaster position="top-center" richColors />
    </>
  );
}
