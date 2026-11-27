"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { syncAllProfilesFromDb, syncMongoSession } from "@/lib/actions";
import { SocketNotificationListener } from "./SocketNotificationListener";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // 1. Sync live approved profiles from MongoDB Atlas
    syncAllProfilesFromDb();

        // 2. Fetch session and sync user + JWT token across browser
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("pj_jwt_token") : null;
        fetch("/api/auth/me", {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.user) {
          const activeToken = data.token || storedToken || "";
          syncMongoSession(data.user, data.profile, activeToken);
          if (activeToken && typeof window !== "undefined") {
            try {
              localStorage.setItem("pj_jwt_token", activeToken);
              localStorage.setItem("pj_token", activeToken);
            } catch {}
          }
        }
      })
      .catch((err) => console.error("Session sync error:", err));
  }, []);

  return (
    <>
      <SocketNotificationListener />
      {!isAdmin && <SiteHeader />}
      <main className="min-h-[calc(100vh-16rem)]">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      {!isAdmin && <SiteFooter />}
      <Toaster position="top-center" richColors />
    </>
  );
}
