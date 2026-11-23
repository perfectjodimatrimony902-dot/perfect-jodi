export type Gender = "female" | "male";
export type ProfileStatus = "pending" | "approved" | "rejected";
export type MembershipTier = "free" | "gold" | "premium";
export type CreatedBy = "Self" | "Parent" | "Sibling" | "Relative";
export type InterestStatus = "pending" | "accepted" | "declined" | "withdrawn";

export interface PartnerPrefs {
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  religions: string[];
  locations: string[];
  education: string;
  occupation: string;
  maritalStatus: string[];
}

export interface Profile {
  id: string;
  ownerId: string;
  name: string;
  gender: Gender;
  dob: string;
  heightCm: number;
  maritalStatus: string;
  religion: string;
  community: string;
  motherTongue: string;
  city: string;
  qualification: string;
  college: string;
  occupation: string;
  company: string;
  income: string;
  familyType: string;
  familyValues: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  diet: string;
  smoking: string;
  drinking: string;
  hobbies: string[];
  about: string;
  prefs: PartnerPrefs;
  tone: number;
  status: ProfileStatus;
  rejectionReason?: string;
  verified: boolean;
  createdBy: CreatedBy;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  gender: Gender;
  dob: string;
  createdBy: CreatedBy;
  role: "member" | "admin";
  membership: MembershipTier;
  membershipSince?: string;
  status: "active" | "suspended";
  profileId?: string;
  createdAt: string;
  prefs?: Partial<AccountPrefs>;
}

export interface AccountPrefs {
  interestAlerts: boolean;
  messageAlerts: boolean;
  matchAlerts: boolean;
  showOnlineStatus: boolean;
  hideProfile: boolean;
}

export type NotificationKind =
  "interest" | "accepted" | "declined" | "message" | "shortlist" | "match" | "system";

export interface Interest {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  status: InterestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileView {
  profileId: string;
  viewerProfileId: string;
  at: string;
}

export interface AppNotification {
  id: string;
  accountId: string;
  text: string;
  link?: string;
  at: string;
  read: boolean;
  kind?: NotificationKind;
}

export interface Report {
  id: string;
  profileId: string;
  reporterAccountId: string;
  reason: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  at: string;
}

export interface SuccessStory {
  id: string;
  couple: string;
  city: string;
  marriedOn: string;
  story: string;
  published: boolean;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "resolved";
  at: string;
}

export interface ChatMessage {
  id: string;
  fromProfileId: string;
  text: string;
  at: string;
  simulated?: boolean;
}

export interface Conversation {
  id: string;
  profileIds: [string, string];
  messages: ChatMessage[];
  /** Per-profile ISO timestamp of the last time that member opened this conversation. */
  lastRead?: Record<string, string>;
}

export interface Plan {
  tier: MembershipTier;
  name: string;
  price: number;
  durationMonths: number;
  blurb: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  allowRegistrations: boolean;
  requireApproval: boolean;
}

export interface DemoState {
  version: number;
  session: { accountId: string } | null;
  accounts: Account[];
  profiles: Profile[];
  interests: Interest[];
  shortlists: Record<string, string[]>;
  recentlyViewed: Record<string, string[]>;
  views: ProfileView[];
  notifications: AppNotification[];
  reports: Report[];
  stories: SuccessStory[];
  enquiries: Enquiry[];
  conversations: Conversation[];
  plans: Plan[];
  settings: SiteSettings;
}
