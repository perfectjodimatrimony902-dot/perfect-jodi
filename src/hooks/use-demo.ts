import { useMemo } from "react";
import { useDemoState } from "@/lib/store";

export function useSession() {
  const state = useDemoState();
  return useMemo(() => {
    const account = state.session
      ? state.accounts.find((a) => a.id === state.session!.accountId)
      : undefined;
    const profile = account
      ? state.profiles.find(
        (p) =>
          (account.profileId && p.id === account.profileId) ||
          p.ownerId === account.id,
      )
      : undefined;
    return { state, account, profile };
  }, [state]);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
