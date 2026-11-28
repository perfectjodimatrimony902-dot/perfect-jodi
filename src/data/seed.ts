import { BRAND, DEMO_ADMIN } from "@/config/brand";
import { STORY_PHOTOS } from "./profile-photos";
import type { Account, DemoState, Profile } from "@/lib/types";

export const STATE_VERSION = 3;

/**
 * Creates initial baseline state for the app.
 * All dummy/mock user profiles have been removed. Genuine profiles are fetched
 * dynamically from the live MongoDB Atlas database.
 */
export function createSeed(): DemoState {
  const accounts: Account[] = [
    {
      id: "u-admin",
      name: "Demo Admin",
      email: DEMO_ADMIN.email,
      mobile: "9800000000",
      password: DEMO_ADMIN.password,
      gender: "female",
      dob: "1985-01-01",
      createdBy: "Self",
      role: "admin",
      membership: "free",
      status: "active",
      createdAt: "2026-08-01T09:00:00Z",
    },
  ];

  const profiles: Profile[] = [];

  return {
    version: STATE_VERSION,
    session: null,
    accounts,
    profiles,
    interests: [],
    shortlists: {},
    recentlyViewed: {},
    views: [],
    notifications: [],
    reports: [],
    stories: [
      {
        id: "s1",
        couple: "Rahul & Nisha",
        city: "Pune",
        marriedOn: "2026-02-14",
        published: true,
        photoUrl: STORY_PHOTOS.s1,
        story:
          "Our parents created our profiles within a week of each other. One interest, three family video calls and a lot of laughter later, we knew. We married in a small ceremony by the river.",
      },
      {
        id: "s2",
        couple: "Farhan & Zoya",
        city: "Hyderabad",
        marriedOn: "2025-12-05",
        published: true,
        photoUrl: STORY_PHOTOS.s2,
        story:
          "We matched on our love for old Hindi songs and biryani. Our families met over chai and the rest is a beautiful story we are still writing.",
      },
      {
        id: "s3",
        couple: "Karthik & Divya",
        city: "Chennai",
        marriedOn: "2026-05-20",
        published: true,
        photoUrl: STORY_PHOTOS.s3,
        story:
          "Divya's detailed partner preferences made me smile — I matched every one except 'must love mornings'. She has forgiven me for that.",
      },
      {
        id: "s4",
        couple: "Harpreet & Jaspreet",
        city: "Chandigarh",
        marriedOn: "2026-03-11",
        published: true,
        photoUrl: STORY_PHOTOS.s4,
        story:
          "Both families wanted someone grounded and kind. The shortlist feature helped my mother keep track — Jaspreet was the first on it.",
      },
      {
        id: "s5",
        couple: "Anil & Leena",
        city: "Kochi",
        marriedOn: "2026-08-30",
        published: true,
        photoUrl: STORY_PHOTOS.s5,
        story:
          "A second chance at love for both of us. We are grateful for a space that treated our story with respect.",
      },
      {
        id: "s6",
        couple: "Manish & Kriti",
        city: "Jaipur",
        marriedOn: "2026-10-02",
        published: false,
        photoUrl: STORY_PHOTOS.s6,
        story:
          "We met through the platform in January and married in October. Thank you for making it so easy for our families.",
      },
    ],
    enquiries: [],
    conversations: [],
    plans: [
      {
        tier: "free",
        name: "Free",
        price: 0,
        durationMonths: 0,
        blurb: "Create a profile and start exploring.",
      },
      {
        tier: "gold",
        name: "Gold",
        price: 2499,
        durationMonths: 3,
        blurb: "Connect faster with more visibility.",
      },
      {
        tier: "premium",
        name: "Premium",
        price: 4999,
        durationMonths: 6,
        blurb: "Priority matchmaking and full access.",
      },
    ],
    settings: {
      siteName: BRAND.name,
      tagline: BRAND.tagline,
      contactEmail: BRAND.supportEmail,
      contactPhone: BRAND.supportPhone,
      allowRegistrations: true,
      requireApproval: true,
    },
  };
}
