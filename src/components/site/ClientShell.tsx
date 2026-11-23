"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Toaster } from "@/components/ui/sonner";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

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
