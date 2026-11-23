/**
 * Pure business rules shared by actions and UI. No storage access here, so they are easy to test
 * and can move to a real backend later.
 */
import type { AccountPrefs, Conversation, Interest, InterestStatus } from "./types";

/** Most recent interest between two profiles, in either direction. */
export function latestInterestBetween(
  interests: Interest[],
  a: string,
  b: string,
): Interest | undefined {
  return interests
    .filter(
      (i) =>
        (i.fromProfileId === a && i.toProfileId === b) ||
        (i.fromProfileId === b && i.toProfileId === a),
    )
    .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt))[0];
}

/** Messaging is allowed only after an interest between the two members has been accepted. */
export function canMessage(interests: Interest[], a: string, b: string): boolean {
  if (!a || !b || a === b) return false;
  return interests.some(
    (i) =>
      i.status === "accepted" &&
      ((i.fromProfileId === a && i.toProfileId === b) ||
        (i.fromProfileId === b && i.toProfileId === a)),
  );
}

/** A new interest can be sent unless one is already pending or accepted between the pair. */
export function canSendInterest(interests: Interest[], from: string, to: string): boolean {
  if (!from || !to || from === to) return false;
  return !interests.some(
    (i) =>
      ((i.fromProfileId === from && i.toProfileId === to) ||
        (i.fromProfileId === to && i.toProfileId === from)) &&
      (i.status === "pending" || i.status === "accepted"),
  );
}

/** Messages from the other member that arrived after I last opened the conversation. */
export function unreadCount(convo: Conversation | undefined, me: string): number {
  if (!convo) return 0;
  const seen = convo.lastRead?.[me] ?? "";
  return convo.messages.filter((m) => m.fromProfileId !== me && m.at > seen).length;
}

export const INTEREST_LABELS: Record<InterestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Rejected",
  withdrawn: "Withdrawn",
};

export const DEFAULT_ACCOUNT_PREFS: AccountPrefs = {
  interestAlerts: true,
  messageAlerts: true,
  matchAlerts: true,
  showOnlineStatus: true,
  hideProfile: false,
};

export function accountPrefs(p?: Partial<AccountPrefs>): AccountPrefs {
  return { ...DEFAULT_ACCOUNT_PREFS, ...p };
}

/** Plan validity end date, or undefined for the free plan. */
export function membershipExpiry(
  since: string | undefined,
  durationMonths: number,
): Date | undefined {
  if (!since || durationMonths <= 0) return undefined;
  const d = new Date(since);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setMonth(d.getMonth() + durationMonths);
  return d;
}
