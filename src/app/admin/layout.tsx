"use client";

import { Link, useNavigate } from "@/lib/navigation";
import {
  BarChart3,
  ExternalLink,
  Flag,
  Heart,
  Inbox,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Crown,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AuthGate } from "@/components/common/AuthGate";
import { useSession } from "@/hooks/use-demo";
import { logout } from "@/lib/actions";

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useSession();
  const pending = state.profiles.filter((p) => p.status === "pending").length;
  const reports = state.reports.filter((r) => r.status === "open").length;
  const enquiries = state.enquiries.filter((e) => e.status === "new").length;
  const links = [{ to: "/admin", label: "Overview", icon: BarChart3, exact: true }] as const;
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          onClick={onNavigate}
          activeOptions={{ exact: "exact" in l }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}
        >
          <l.icon className="h-4 w-4" />
          <span className="flex-1">{l.label}</span>
          {"count" in l && typeof l.count === "number" && l.count > 0 && (
            <span className="rounded-full bg-sidebar-primary px-1.5 text-[11px] font-bold text-sidebar-primary-foreground">
              {l.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { state, account } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const onLogout = () => {
    logout();
    toast.success("Logged out of admin.");
    navigate({ to: "/login" });
  };
  const brand = (
    <div className="px-3">
      <p className="text-2xl font-bold text-sidebar-foreground">{state.settings.siteName}</p>
      <p className="eyebrow mt-1">Admin · demo</p>
    </div>
  );

  return (
    <AuthGate role="admin">
      <div className="flex min-h-screen bg-background">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 overflow-y-auto bg-sidebar p-4 lg:flex">
          {brand}
          <AdminNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open admin menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-4">
                <SheetHeader className="p-0">
                  <SheetTitle className="sr-only">Admin menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  {brand}
                  <AdminNav onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-foreground">
              Demo admin mode
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {account?.email}
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <ExternalLink className="h-4 w-4" /> View site
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
