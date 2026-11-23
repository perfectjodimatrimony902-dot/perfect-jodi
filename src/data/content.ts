import type { MembershipTier } from "@/lib/types";

export const HOW_IT_WORKS = [
  {
    title: "Register for free",
    text: "Create an account for yourself or a family member in under two minutes.",
  },
  {
    title: "Build your profile",
    text: "Share education, family background, lifestyle and what you look for in a partner.",
  },
  {
    title: "Discover matches",
    text: "Search with detailed filters or review matches suggested from your preferences.",
  },
  {
    title: "Connect with families",
    text: "Send interests, shortlist profiles and begin conversations once both sides agree.",
  },
];

export const PLAN_FEATURES: { label: string; tiers: MembershipTier[] }[] = [
  { label: "Create profile & browse matches", tiers: ["free", "gold", "premium"] },
  { label: "Send & receive interests", tiers: ["free", "gold", "premium"] },
  { label: "Shortlist profiles", tiers: ["free", "gold", "premium"] },
  { label: "Message accepted connections", tiers: ["gold", "premium"] },
  { label: "See who viewed your profile", tiers: ["gold", "premium"] },
  { label: "Highlighted profile in search", tiers: ["gold", "premium"] },
  { label: "Priority customer support", tiers: ["premium"] },
  { label: "Dedicated relationship advisor (demo)", tiers: ["premium"] },
];

export const TESTIMONIALS = [
  {
    quote:
      "As a mother searching for my daughter, I appreciated how respectful and private everything felt.",
    name: "Lakshmi R.",
    role: "Parent, Coimbatore",
    highlight: "Respectful & Private",
  },
  {
    quote:
      "The filters actually work the way families think — community, mother tongue, location, all of it.",
    name: "Harsh V.",
    role: "Member, Indore",
    highlight: "Intuitive Filters",
  },
  {
    quote:
      "Verified profiles gave us confidence. We found a wonderful match for my brother within months.",
    name: "Nazia S.",
    role: "Sibling, Lucknow",
    highlight: "100% Verified Profiles",
  },
  {
    quote:
      "We connected through Perfect Jodi, met along with both our families, and immediately knew it was the right fit. Forever grateful!",
    name: "Priya & Rohan",
    role: "Happily Married, Pune",
    highlight: "Blessed Match",
  },
  {
    quote:
      "The privacy controls and verified identity check made my parents feel completely comfortable searching online.",
    name: "Aditya M.",
    role: "Member, Bengaluru",
    highlight: "Safe Family Search",
  },
  {
    quote:
      "Simple, transparent, and completely free of spam calls. Perfect Jodi respects Indian cultural traditions and family values.",
    name: "Sunita & Rajesh A.",
    role: "Parents, Delhi NCR",
    highlight: "Family Values First",
  },
];

export const FAQS = [
  {
    q: "Is registration free?",
    a: "Yes. Creating an account and a complete profile is free. Paid plans add visibility and messaging features.",
  },
  {
    q: "Can parents create a profile for their son or daughter?",
    a: "Absolutely. Choose ‘Parent’, ‘Sibling’ or ‘Relative’ in “Profile created by” during registration.",
  },
  {
    q: "Are my phone number and email visible to others?",
    a: "No. Contact details are never shown on public profiles. Members connect through interests and messages first.",
  },
  {
    q: "How are profiles verified?",
    a: "Our team reviews every new profile before it appears in search. Verified profiles carry a badge.",
  },
  {
    q: "How is the compatibility percentage calculated?",
    a: "It's a simple demo estimate of how many of your partner preferences a profile meets — not a scientific assessment.",
  },
  {
    q: "Can I report a suspicious profile?",
    a: "Yes. Every profile page has a Report button and our moderators review each report.",
  },
];
