import { DEMO_OTP } from "@/config/brand";
import { getState, setState, uid } from "./store";
import { accountPrefs, canMessage, canSendInterest } from "./rules";
import { recommendedMatches } from "./matching";
import type {
  Account,
  AccountPrefs,
  CreatedBy,
  DemoState,
  Gender,
  InterestStatus,
  MembershipTier,
  NotificationKind,
  Plan,
  Profile,
  SiteSettings,
  SuccessStory,
} from "./types";

type Result = { ok: true } | { ok: false; error: string };
const now = () => new Date().toISOString();

function currentAccount(s: DemoState) {
  return s.session ? s.accounts.find((a) => a.id === s.session!.accountId) : undefined;
}
function myProfileId(s: DemoState) {
  return currentAccount(s)?.profileId;
}
function ownerOf(s: DemoState, profileId: string) {
  return s.profiles.find((p) => p.id === profileId)?.ownerId;
}
function nameOf(s: DemoState, profileId: string) {
  return s.profiles.find((p) => p.id === profileId)?.name ?? "A member";
}
const ALERT_PREF: Partial<Record<NotificationKind, keyof AccountPrefs>> = {
  interest: "interestAlerts",
  accepted: "interestAlerts",
  declined: "interestAlerts",
  shortlist: "interestAlerts",
  message: "messageAlerts",
  match: "matchAlerts",
};

function notify(
  s: DemoState,
  accountId: string | undefined,
  text: string,
  link?: string,
  kind: NotificationKind = "system",
): DemoState {
  if (!accountId) return s;
  const pref = ALERT_PREF[kind];
  const acc = s.accounts.find((a) => a.id === accountId);
  if (pref && acc && !accountPrefs(acc.prefs)[pref]) return s;
  return {
    ...s,
    notifications: [
      { id: uid("n"), accountId, text, link, at: now(), read: false, kind },
      ...s.notifications,
    ],
  };
}

/* ---------- Auth ---------- */

export function login(email: string, password: string): Result & { role?: Account["role"] } {
  const s = getState();
  const acc = s.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!acc || acc.password !== password)
    return { ok: false, error: "Incorrect email or password." };
  if (acc.status === "suspended")
    return { ok: false, error: "This account has been suspended. Please contact support." };
  setState((st) => {
    let next: DemoState = { ...st, session: { accountId: acc.id } };
    // Demo stand-in for a daily "new suggested matches" digest.
    const me = acc.profileId ? st.profiles.find((p) => p.id === acc.profileId) : undefined;
    const recent = st.notifications.some(
      (n) =>
        n.accountId === acc.id &&
        n.kind === "match" &&
        Date.now() - new Date(n.at).getTime() < 864e5,
    );
    if (acc.role === "member" && me && me.status === "approved" && !recent) {
      const count = recommendedMatches(me, st.profiles).filter((m) => m.compat.score >= 70).length;
      if (count > 0)
        next = notify(
          next,
          acc.id,
          `We found ${count} suggested matches for you today.`,
          "/matches",
          "match",
        );
    }
    return next;
  });
  return { ok: true, role: acc.role };
}

export function logout() {
  setState((s) => ({ ...s, session: null }));
}

export interface RegisterInput {
  name: string;
  gender: Gender;
  dob: string;
  email: string;
  mobile: string;
  password: string;
  createdBy: CreatedBy;
}

export function checkRegistration(input: RegisterInput): Result {
  const s = getState();
  if (!s.settings.allowRegistrations)
    return { ok: false, error: "New registrations are temporarily paused." };
  if (s.accounts.some((a) => a.email.toLowerCase() === input.email.trim().toLowerCase()))
    return { ok: false, error: "An account with this email already exists." };
  if (s.accounts.some((a) => a.mobile === input.mobile))
    return { ok: false, error: "This mobile number is already registered." };
  return { ok: true };
}

export function completeRegistration(
  input: RegisterInput,
  otp: string,
  details: Partial<Profile> = {},
): Result {
  if (otp !== DEMO_OTP)
    return { ok: false, error: "That code doesn't match. Use the demo code shown." };
  const check = checkRegistration(input);
  if (!check.ok) return check;
  const accountId = uid("u");
  const profileId = uid("p");
  setState((s) => {
    const account: Account = {
      id: accountId,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      mobile: input.mobile,
      password: input.password,
      gender: input.gender,
      dob: input.dob,
      createdBy: input.createdBy,
      role: "member",
      membership: "free",
      status: "active",
      profileId,
      createdAt: now(),
    };
    const profile: Profile = {
      id: profileId,
      ownerId: accountId,
      name: account.name,
      gender: input.gender,
      dob: input.dob,
      heightCm: 0,
      maritalStatus: "",
      religion: "",
      community: "",
      motherTongue: "",
      city: "",
      qualification: "",
      college: "",
      occupation: "",
      company: "",
      income: "",
      familyType: "",
      familyValues: "",
      fatherOccupation: "",
      motherOccupation: "",
      siblings: "",
      diet: "",
      smoking: "",
      drinking: "",
      hobbies: [],
      about: "",
      prefs:
        input.gender === "female"
          ? {
              ageMin: 25,
              ageMax: 35,
              heightMin: 160,
              heightMax: 190,
              religions: [],
              locations: [],
              education: "",
              occupation: "",
              maritalStatus: [],
            }
          : {
              ageMin: 21,
              ageMax: 32,
              heightMin: 150,
              heightMax: 175,
              religions: [],
              locations: [],
              education: "",
              occupation: "",
              maritalStatus: [],
            },
      tone: Math.floor(Math.random() * 6),
      status: "pending",
      verified: false,
      createdBy: input.createdBy,
      createdAt: now(),
    };
    Object.assign(profile, details, {
      id: profileId,
      ownerId: accountId,
      name: account.name,
      gender: input.gender,
      dob: input.dob,
      status: "pending",
      verified: false,
      createdBy: input.createdBy,
      prefs: { ...profile.prefs, ...(details.prefs ?? {}) },
    });
    let next: DemoState = {
      ...s,
      accounts: [...s.accounts, account],
      profiles: [...s.profiles, profile],
      session: { accountId },
    };
    next = notify(
      next,
      accountId,
      "Welcome! Complete your profile so families can find you.",
      "/my-profile",
    );
    return next;
  });
  return { ok: true };
}

/* ---------- Profile ---------- */

export function saveMyProfile(patch: Partial<Profile>, submit = false): Result {
  const s = getState();
  const pid = myProfileId(s);
  if (!pid) return { ok: false, error: "Please sign in again." };
  setState((st) => {
    const profiles = st.profiles.map((p) => {
      if (p.id !== pid) return p;
      const updated: Profile = { ...p, ...patch };
      if (submit) {
        updated.status =
          st.settings.requireApproval && p.status !== "approved" ? "pending" : "approved";
        if (p.status === "rejected")
          updated.status = st.settings.requireApproval ? "pending" : "approved";
        updated.rejectionReason = undefined;
      }
      return updated;
    });
    const accounts = patch.name
      ? st.accounts.map((a) => (a.profileId === pid ? { ...a, name: patch.name! } : a))
      : st.accounts;
    return { ...st, profiles, accounts };
  });
  return { ok: true };
}

/* ---------- Interests ---------- */

export function sendInterest(toProfileId: string): Result {
  const s = getState();
  const from = myProfileId(s);
  if (!from) return { ok: false, error: "Please sign in to send an interest." };
  if (from === toProfileId) return { ok: false, error: "You can't send an interest to yourself." };
  if (!canSendInterest(s.interests, from, toProfileId))
    return { ok: false, error: "You're already connected or have a pending interest." };
  setState((st) => {
    const next: DemoState = {
      ...st,
      interests: [
        {
          id: uid("i"),
          fromProfileId: from,
          toProfileId,
          status: "pending",
          createdAt: now(),
          updatedAt: now(),
        },
        ...st.interests,
      ],
    };
    return notify(
      next,
      ownerOf(st, toProfileId),
      `${nameOf(st, from)} sent you an interest.`,
      "/interests/received",
      "interest",
    );
  });
  return { ok: true };
}

export function setInterestStatus(interestId: string, status: InterestStatus): Result {
  const s = getState();
  const pid = myProfileId(s);
  const it = s.interests.find((i) => i.id === interestId);
  if (!it || !pid) return { ok: false, error: "Interest not found." };
  if ((status === "accepted" || status === "declined") && it.toProfileId !== pid)
    return { ok: false, error: "Only the receiver can respond to this interest." };
  if (status === "withdrawn" && it.fromProfileId !== pid)
    return { ok: false, error: "Only the sender can withdraw this interest." };
  setState((st) => {
    let next: DemoState = {
      ...st,
      interests: st.interests.map((i) =>
        i.id === interestId ? { ...i, status, updatedAt: now() } : i,
      ),
    };
    if (status === "accepted") {
      next = notify(
        next,
        ownerOf(st, it.fromProfileId),
        `${nameOf(st, it.toProfileId)} accepted your interest. You can now message each other.`,
        `/messages?with=${it.toProfileId}`,
        "accepted",
      );
    } else if (status === "declined") {
      next = notify(
        next,
        ownerOf(st, it.fromProfileId),
        `${nameOf(st, it.toProfileId)} did not accept your interest this time.`,
        "/interests/sent",
        "declined",
      );
    }
    return next;
  });
  return { ok: true };
}

/* ---------- Shortlist, views, reports ---------- */

export function toggleShortlist(profileId: string): Result & { added?: boolean } {
  const s = getState();
  const acc = currentAccount(s);
  if (!acc) return { ok: false, error: "Please sign in to shortlist profiles." };
  const list = s.shortlists[acc.id] ?? [];
  const added = !list.includes(profileId);
  setState((st) => {
    const next: DemoState = {
      ...st,
      shortlists: {
        ...st.shortlists,
        [acc.id]: added ? [profileId, ...list] : list.filter((id) => id !== profileId),
      },
    };
    if (!added || !acc.profileId) return next;
    return notify(
      next,
      ownerOf(st, profileId),
      `${nameOf(st, acc.profileId)} shortlisted your profile.`,
      `/profiles/${acc.profileId}`,
      "shortlist",
    );
  });
  return { ok: true, added };
}

export function recordProfileView(profileId: string) {
  const s = getState();
  const acc = currentAccount(s);
  if (!acc || acc.role !== "member" || acc.profileId === profileId) return;
  const viewer = acc.profileId!;
  setState((st) => {
    const recent = [
      profileId,
      ...(st.recentlyViewed[acc.id] ?? []).filter((id) => id !== profileId),
    ].slice(0, 12);
    const already = st.views.some(
      (v) =>
        v.profileId === profileId &&
        v.viewerProfileId === viewer &&
        Date.now() - new Date(v.at).getTime() < 36e5,
    );
    return {
      ...st,
      recentlyViewed: { ...st.recentlyViewed, [acc.id]: recent },
      views: already ? st.views : [{ profileId, viewerProfileId: viewer, at: now() }, ...st.views],
    };
  });
}

export function reportProfile(profileId: string, reason: string, details: string): Result {
  const s = getState();
  const acc = currentAccount(s);
  if (!acc) return { ok: false, error: "Please sign in to report a profile." };
  if (
    s.reports.some(
      (r) => r.profileId === profileId && r.reporterAccountId === acc.id && r.status === "open",
    )
  )
    return { ok: false, error: "You've already reported this profile. Our team is reviewing it." };
  setState((st) => ({
    ...st,
    reports: [
      {
        id: uid("r"),
        profileId,
        reporterAccountId: acc.id,
        reason,
        details,
        status: "open",
        at: now(),
      },
      ...st.reports,
    ],
  }));
  return { ok: true };
}

/* ---------- Notifications ---------- */

export function markNotificationRead(id: string) {
  setState((s) => ({
    ...s,
    notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  }));
}
export function deleteNotification(id: string) {
  setState((s) => ({ ...s, notifications: s.notifications.filter((n) => n.id !== id) }));
}
export function clearNotifications() {
  const acc = currentAccount(getState());
  if (!acc) return;
  setState((s) => ({ ...s, notifications: s.notifications.filter((n) => n.accountId !== acc.id) }));
}
export function markAllNotificationsRead() {
  const acc = currentAccount(getState());
  if (!acc) return;
  setState((s) => ({
    ...s,
    notifications: s.notifications.map((n) => (n.accountId === acc.id ? { ...n, read: true } : n)),
  }));
}

/* ---------- Messaging (simulated) ---------- */

const SIMULATED_REPLIES = [
  "That's lovely to hear! Tell me more.",
  "I agree completely. Family time matters a lot to me too.",
  "Haha, I'd like that! Maybe our families can connect this weekend?",
  "Thank you for sharing. What does a perfect Sunday look like for you?",
];

function findConversation(st: DemoState, a: string, b: string) {
  return st.conversations.find((c) => c.profileIds.includes(a) && c.profileIds.includes(b));
}

function appendMessage(
  st: DemoState,
  me: string,
  other: string,
  from: string,
  body: string,
): DemoState {
  const at = now();
  const msg = { id: uid("m"), fromProfileId: from, text: body, at, simulated: true };
  const existing = findConversation(st, me, other);
  if (existing) {
    return {
      ...st,
      conversations: st.conversations.map((c) =>
        c.id === existing.id
          ? {
              ...c,
              messages: [...c.messages, msg],
              lastRead: from === me ? { ...c.lastRead, [me]: at } : c.lastRead,
            }
          : c,
      ),
    };
  }
  return {
    ...st,
    conversations: [
      ...st.conversations,
      {
        id: uid("c"),
        profileIds: [me, other],
        messages: [msg],
        lastRead: from === me ? { [me]: at } : {},
      },
    ],
  };
}

/** Marks every message in the conversation with `otherProfileId` as read for the signed-in member. */
export function markConversationRead(otherProfileId: string) {
  const s = getState();
  const me = myProfileId(s);
  if (!me) return;
  const convo = findConversation(s, me, otherProfileId);
  const last = convo?.messages.at(-1);
  if (!convo || !last || (convo.lastRead?.[me] ?? "") >= last.at) return;
  setState((st) => ({
    ...st,
    conversations: st.conversations.map((c) =>
      c.id === convo.id ? { ...c, lastRead: { ...c.lastRead, [me]: now() } } : c,
    ),
  }));
}

export function sendMessage(otherProfileId: string, text: string): Result {
  const s = getState();
  const me = myProfileId(s);
  if (!me) return { ok: false, error: "Please sign in." };
  if (!canMessage(s.interests, me, otherProfileId))
    return {
      ok: false,
      error: "You can message a member only after an interest between you is accepted.",
    };
  const clean = text.trim();
  if (!clean) return { ok: false, error: "Message can't be empty." };
  if (clean.length > 1000)
    return { ok: false, error: "Please keep messages under 1000 characters." };
  setState((st) => appendMessage(st, me, otherProfileId, me, clean));
  window.setTimeout(() => {
    const reply =
      SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)] ?? "Thank you!";
    setState((st) => {
      const next = appendMessage(st, me, otherProfileId, otherProfileId, reply);
      return notify(
        next,
        currentAccount(st)?.id,
        `New message from ${nameOf(st, otherProfileId)}.`,
        `/messages?with=${otherProfileId}`,
        "message",
      );
    });
  }, 1600);
  return { ok: true };
}

/* ---------- Account settings ---------- */

export function changePassword(current: string, next: string): Result {
  const acc = currentAccount(getState());
  if (!acc) return { ok: false, error: "Please sign in again." };
  if (acc.password !== current) return { ok: false, error: "Your current password is incorrect." };
  if (current === next)
    return { ok: false, error: "Choose a password different from your current one." };
  setState((s) => ({
    ...s,
    accounts: s.accounts.map((a) => (a.id === acc.id ? { ...a, password: next } : a)),
  }));
  return { ok: true };
}

export function updateAccountPrefs(patch: Partial<AccountPrefs>): Result {
  const acc = currentAccount(getState());
  if (!acc) return { ok: false, error: "Please sign in again." };
  setState((s) => ({
    ...s,
    accounts: s.accounts.map((a) =>
      a.id === acc.id ? { ...a, prefs: { ...a.prefs, ...patch } } : a,
    ),
  }));
  return { ok: true };
}

/* ---------- Membership ---------- */

export function upgradeMembership(tier: MembershipTier): Result {
  const s = getState();
  const acc = currentAccount(s);
  if (!acc) return { ok: false, error: "Please sign in to upgrade." };
  setState((st) => {
    const next = {
      ...st,
      accounts: st.accounts.map((a) =>
        a.id === acc.id ? { ...a, membership: tier, membershipSince: now() } : a,
      ),
    };
    const plan = st.plans.find((p) => p.tier === tier);
    return notify(
      next,
      acc.id,
      `Your ${plan?.name ?? tier} membership is now active (simulated — no payment taken).`,
      "/my-membership",
    );
  });
  return { ok: true };
}

/* ---------- Public forms ---------- */

export function submitEnquiry(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  setState((s) => ({
    ...s,
    enquiries: [{ id: uid("e"), ...input, status: "new", at: now() }, ...s.enquiries],
  }));
}

export function submitStory(input: {
  couple: string;
  city: string;
  marriedOn: string;
  story: string;
}) {
  setState((s) => ({
    ...s,
    stories: [{ id: uid("s"), ...input, published: false }, ...s.stories],
  }));
}

/* ---------- Admin ---------- */

export function adminSetAccountStatus(accountId: string, status: Account["status"]) {
  setState((s) => ({
    ...s,
    accounts: s.accounts.map((a) => (a.id === accountId ? { ...a, status } : a)),
  }));
}

export function adminDeleteAccount(accountId: string) {
  setState((s) => {
    const acc = s.accounts.find((a) => a.id === accountId);
    const pid = acc?.profileId;
    return {
      ...s,
      accounts: s.accounts.filter((a) => a.id !== accountId),
      profiles: s.profiles.filter((p) => p.id !== pid),
      interests: s.interests.filter((i) => i.fromProfileId !== pid && i.toProfileId !== pid),
      reports: s.reports.filter((r) => r.profileId !== pid),
      conversations: s.conversations.filter((c) => !pid || !c.profileIds.includes(pid)),
      session: s.session?.accountId === accountId ? null : s.session,
    };
  });
}

export function adminSetProfileStatus(
  profileId: string,
  status: Profile["status"],
  reason?: string,
) {
  setState((s) => {
    const next = {
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === profileId
          ? {
              ...p,
              status,
              rejectionReason:
                status === "rejected" ? reason || "Did not meet profile guidelines" : undefined,
            }
          : p,
      ),
    };
    const owner = ownerOf(s, profileId);
    if (status === "approved")
      return notify(
        next,
        owner,
        "Your profile has been approved and is now visible to members.",
        "/profile",
      );
    if (status === "rejected")
      return notify(
        next,
        owner,
        `Your profile needs changes: ${reason || "it did not meet our guidelines"}.`,
        "/my-profile",
      );
    return next;
  });
}

export function adminSetVerified(profileId: string, verified: boolean) {
  setState((s) => ({
    ...s,
    profiles: s.profiles.map((p) => (p.id === profileId ? { ...p, verified } : p)),
  }));
}

export function adminSetReportStatus(reportId: string, status: "open" | "resolved" | "dismissed") {
  setState((s) => ({
    ...s,
    reports: s.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
  }));
}

export function adminSetMembership(accountId: string, tier: MembershipTier) {
  setState((s) => ({
    ...s,
    accounts: s.accounts.map((a) =>
      a.id === accountId ? { ...a, membership: tier, membershipSince: now() } : a,
    ),
  }));
}

export function adminUpdatePlan(tier: MembershipTier, patch: Partial<Plan>) {
  setState((s) => ({
    ...s,
    plans: s.plans.map((p) => (p.tier === tier ? { ...p, ...patch } : p)),
  }));
}

export function adminSaveStory(story: Omit<SuccessStory, "id"> & { id?: string }) {
  setState((s) => {
    if (story.id)
      return {
        ...s,
        stories: s.stories.map((st) => (st.id === story.id ? { ...st, ...story, id: st.id } : st)),
      };
    return { ...s, stories: [{ ...story, id: uid("s") }, ...s.stories] };
  });
}

export function adminDeleteStory(id: string) {
  setState((s) => ({ ...s, stories: s.stories.filter((st) => st.id !== id) }));
}

export function adminSetEnquiryStatus(id: string, status: "new" | "resolved") {
  setState((s) => ({
    ...s,
    enquiries: s.enquiries.map((e) => (e.id === id ? { ...e, status } : e)),
  }));
}

export function adminDeleteEnquiry(id: string) {
  setState((s) => ({ ...s, enquiries: s.enquiries.filter((e) => e.id !== id) }));
}

export function adminUpdateSettings(patch: Partial<SiteSettings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}
