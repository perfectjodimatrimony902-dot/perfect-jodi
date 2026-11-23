"use client";

import { useRouter } from "@/lib/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";
import { formatDateTime, useSession } from "@/hooks/use-demo";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions";
import { cn } from "@/lib/utils";



export default function NotificationsPage() {
  const { state, account } = useSession();
  const router = useRouter();
  const list = account ? state.notifications.filter((n) => n.accountId === account.id) : [];
  const unread = list.filter((n) => !n.read).length;

  return (
    <div>
      <MemberPageTitle
        title="Notifications"
        text={unread ? `${unread} unread` : "You're all caught up."}
        action={
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead} disabled={!unread}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />
      {list.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          text="We'll let you know when someone sends you an interest."
        />
      ) : (
        <ul className="surface divide-y overflow-hidden">
          {list.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.link) router.push(n.link);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-muted/60",
                  !n.read && "bg-primary-soft/50",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    n.read ? "bg-border" : "bg-primary",
                  )}
                  aria-hidden
                />
                <span className="flex-1">
                  <span className={cn("block text-sm", !n.read && "font-semibold")}>{n.text}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(n.at)}</span>
                </span>
                {!n.read && <span className="sr-only">Unread</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
