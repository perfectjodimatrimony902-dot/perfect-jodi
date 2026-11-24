"use client";

import { Link } from "@/lib/navigation";
import type { ReactNode } from "react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { getProfilePhoto } from "@/data/profile-photos";
import { ageFromDob, shortHeight } from "@/lib/matching";
import type { Profile } from "@/lib/types";

export function MiniProfileRow({
  profile,
  meta,
  actions,
}: {
  profile: Profile;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ProfileAvatar
          name={profile.name}
          imageUrl={profile.photoUrl || getProfilePhoto(profile)}
          tone={profile.tone}
          photoUrl={profile.photoUrl}
          size="sm"
          className="ring-1 ring-offset-1"
        />
        <div className="min-w-0">
          <Link
            to="/profiles/$id"
            params={{ id: profile.id }}
            className="block truncate font-semibold hover:text-primary"
          >
            {profile.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {ageFromDob(profile.dob)} yrs · {shortHeight(profile.heightCm)} · {profile.city} ·{" "}
            {profile.occupation}
          </p>
          {meta && <div className="mt-1 text-xs text-muted-foreground">{meta}</div>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
