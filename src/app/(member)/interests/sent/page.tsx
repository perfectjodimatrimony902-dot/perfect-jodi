"use client";

import { InterestList } from "@/components/member/InterestList";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";

export default function SentInterestsPage() {
  return (
    <div>
      <MemberPageTitle
        title="Interests Sent"
        text="Interests you've sent. You can withdraw any that are still pending."
      />
      <InterestList direction="sent" />
    </div>
  );
}
