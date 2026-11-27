"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-demo";
import { getSocket } from "@/lib/socket-client";
import { syncNotificationsFromDb, syncInterestsFromDb } from "@/lib/actions";
import { setState } from "@/lib/store";
import type { NotificationKind } from "@/lib/types";

/**
 * Plays a subtle, pleasant two-tone chime via Web Audio API when a new notification arrives.
 */
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    const currentTime = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.45);

    osc.start(currentTime);
    osc.stop(currentTime + 0.45);
  } catch {
    // Ignore audio permission/context errors silently
  }
}

export function SocketNotificationListener() {
  const { account } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const currentPathRef = useRef(pathname);

  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!account) return;

    // 1. Initial background synchronization with database
    syncNotificationsFromDb();
    syncInterestsFromDb();

    // 2. Initialize authenticated socket singleton
    const socket = getSocket();
    if (!socket) return;

    // 3. Handler for incoming connection / system notifications
    const handleNewNotification = (data: {
      id?: string;
      title?: string;
      text: string;
      link?: string;
      kind?: string;
      senderName?: string;
      createdAt?: string;
    }) => {
      // Audio cue
      playChime();

      const notifId = data.id || `notif_${Date.now()}`;
      const notifLink = data.link || "/interests/received";

      // Display live Sonner toast
      toast.info(data.title || "New Connection Request", {
        description: data.text,
        icon: "💍",
        duration: 9000,
        action: {
          label: "View Request",
          onClick: () => router.push(notifLink),
        },
      });

      // Update local state to immediately update bell badge counter
      setState((st) => {
        if (st.notifications.some((n) => n.id === notifId)) return st;
        return {
          ...st,
          notifications: [
            {
              id: notifId,
              accountId: account.id,
              text: data.text,
              link: notifLink,
              at: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
              read: false,
              kind: (data.kind as NotificationKind) || "interest",
            },
            ...st.notifications,
          ],
        };
      });

      // Also refresh interests data in case user is viewing interests page
      syncInterestsFromDb();
    };

    // 4. Handler for chat messages received while not on messages page
    const handleReceiveMessage = (data: {
      conversationId: string;
      message: string;
      senderId?: string;
      senderName?: string;
      sender?: { _id?: string; name?: string };
    }) => {
      if (currentPathRef.current?.startsWith("/messages")) {
        // User is actively on messages page; chat view handles its own rendering
        return;
      }

      playChime();
      const senderName = data.senderName || data.sender?.name || "A member";

        toast.info(`💬 ${senderName}`, {
          description: data.message,
          duration: 7000,
          action: {
            label: "Open Chat",
            onClick: () => router.push("/messages"),
          },
        });
      };

      socket.on("new-notification", handleNewNotification);
      socket.on("receive-message", handleReceiveMessage);

      return () => {
        socket.off("new-notification", handleNewNotification);
        socket.off("receive-message", handleReceiveMessage);
      };
    }, [account, router]);

  return null;
}

