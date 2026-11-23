"use client";

import { Link, useNavigate } from "@/lib/navigation";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Heart,
  Send,
  Shield,
  User,
  Inbox,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useSession } from "@/hooks/use-demo";
import { logout } from "@/lib/actions";

export const PUBLIC_NAV = [
  { to: "/profiles", label: "Browse Profiles" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/membership", label: "Membership" },
  { to: "/success-stories", label: "Success Stories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const MEMBER_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-profile", label: "My Profile", icon: User },
  { to: "/interests/received", label: "Interests Received", icon: Inbox },
  { to: "/interests/sent", label: "Interests Sent", icon: Send },
  { to: "/shortlist", label: "Shortlist", icon: Heart },
  { to: "/messages", label: "Messages", icon: MessageCircle },
] as const;

export function SiteHeader() {
  const { state, account, profile } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = account
    ? state.notifications.filter((n) => n.accountId === account.id && !n.read).length
    : 0;

  const onLogout = () => {
    logout();
    setOpen(false);
    toast.success("You have been logged out.");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {PUBLIC_NAV.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {account ? (
            <>
              {account.role === "member" && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={`Notifications (${unread} unread)`}
                >
                  <Link to="/notifications">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {unread}
                      </span>
                    )}
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted sm:flex">
                    <ProfileAvatar
                      name={account.name}
                      tone={profile?.tone ?? 5}
                      size="sm"
                      className="h-8 w-8 text-xs ring-1 ring-offset-1"
                    />
                    <span className="max-w-28 truncate text-sm font-medium">
                      {account.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-sm font-semibold">{account.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{account.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {account.role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="mr-2 h-4 w-4" /> Admin panel
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    MEMBER_LINKS.map(({ to, label, icon: Icon }) => (
                      <DropdownMenuItem key={to} asChild>
                        <Link to={to}>
                          <Icon className="mr-2 h-4 w-4" /> {label}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register free</Link>
              </Button>
            </div>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto bg-background">
              <SheetHeader>
                <SheetTitle className="text-left font-display text-2xl text-primary">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col px-4" aria-label="Mobile">
                <Link to="/" onClick={() => setOpen(false)} className="border-b py-3 font-medium">
                  Home
                </Link>
                {PUBLIC_NAV.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="border-b py-3 font-medium"
                    activeProps={{ className: "text-primary" }}
                  >
                    {l.label}
                  </Link>
                ))}
                {account?.role === "member" &&
                  [
                    ...MEMBER_LINKS,
                    { to: "/notifications", label: "Notifications", icon: Bell } as const,
                  ].map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="border-b py-3 text-sm text-foreground/80"
                      activeProps={{ className: "text-primary" }}
                    >
                      {l.label}
                    </Link>
                  ))}
                {account?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="border-b py-3 font-medium"
                  >
                    Admin panel
                  </Link>
                )}
              </nav>
              <div className="mt-6 flex flex-col gap-2 px-4 pb-6">
                {account ? (
                  <Button variant="outline" onClick={onLogout}>
                    <LogOut className="h-4 w-4" /> Log out
                  </Button>
                ) : (
                  <>
                    <Button asChild onClick={() => setOpen(false)}>
                      <Link to="/register">Register free</Link>
                    </Button>
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/login">Log in</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
