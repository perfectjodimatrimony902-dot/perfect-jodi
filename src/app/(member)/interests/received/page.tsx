"use client";

import { InterestList } from "@/components/member/InterestList";
import { MemberPageTitle } from "@/components/member/MemberPageTitle";

export default function ReceivedInterestsPage() {
  return (
    <div>
      <MemberPageTitle
        title="Interests Received"
        text="Members who would like to connect with you. Accept to start a conversation."
      />
      <InterestList direction="received" />
    </div>
  );
}
