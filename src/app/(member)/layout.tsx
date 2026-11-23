"use client";


import { AuthGate } from "@/components/common/AuthGate";
import { MemberNav } from "@/components/member/MemberNav";



export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate role="member">
      <div className="container-page grid gap-6 py-6 lg:grid-cols-[220px_1fr] lg:gap-8 lg:py-10">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <MemberNav />
        </aside>
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </AuthGate>
  );
}
