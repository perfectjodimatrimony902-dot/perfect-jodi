"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useHydrated, Route } from "@/lib/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NativeSelect } from "@/components/common/NativeSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { CardsSkeleton } from "@/components/common/PageLoader";
import { PageHero } from "@/components/site/PageHero";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileFiltersPanel } from "@/components/profile/ProfileFiltersPanel";
import { filterProfiles, sortProfiles, compatibility, type ProfileFilters, type SortKey } from "@/lib/matching";
import { useSession } from "@/hooks/use-demo";
import { cn } from "@/lib/utils";

type BrowseSearch = ProfileFilters & { sort?: SortKey; view?: "grid" | "list" };

const NUM_KEYS = ["ageMin", "ageMax", "heightMin", "heightMax"] as const;

function ProfilesContent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const { state, profile: myProfile, account } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sort = "newest", view = "grid", ...filters } = search;

  const [queryInput, setQueryInput] = useState(filters.q ?? "");

  useEffect(() => {
    setQueryInput(filters.q ?? "");
  }, [filters.q]);

  const myProfileId = myProfile?.id || account?.profileId;
  const myAccountId = account?.id;

  const results = useMemo(() => {
    const approved = state.profiles.filter((p) => {
      if (p.status !== "approved") return false;
      // Never show logged-in user's own profile in Browse Profiles
      if (myProfileId && p.id === myProfileId) return false;
      if (myAccountId && p.ownerId === myAccountId) return false;
      return true;
    });
    return sortProfiles(filterProfiles(approved, filters), sort);
  }, [state.profiles, JSON.stringify(filters), sort, myProfileId, myAccountId]);

  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== "").length;

  const update = (patch: Partial<BrowseSearch>) => {
    navigate({
      to: "/profiles",
      search: { ...search, ...patch },
      replace: true,
    });
  };

  const onFilter = (key: keyof ProfileFilters, v: string) => {
    if (NUM_KEYS.includes(key as (typeof NUM_KEYS)[number])) {
      update({ [key]: v ? Number(v) : undefined });
    } else {
      update({ [key]: v || undefined });
    }
  };

  const clear = () =>
    navigate({
      to: "/profiles",
      search: { sort: search.sort, view: search.view },
      replace: true,
    });

  const panel = (
    <ProfileFiltersPanel
      value={filters}
      onChange={onFilter}
      onClear={clear}
      activeCount={activeCount}
    />
  );

  return (
    <>
      <PageHero
        crumb="Browse Profiles"
        title="Browse profiles"
        subtitle="Every profile below has been reviewed by our team. Contact details stay private."
      />
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="surface sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
            {panel}
          </div>
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-52 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search by name, city or occupation"
                placeholder="Search name, city, occupation…"
                className="h-10 bg-card pl-9"
                value={queryInput}
                onChange={(e) => {
                  setQueryInput(e.target.value);
                  update({ q: e.target.value || undefined });
                }}
              />
            </div>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeCount > 0 ? ` (${activeCount})` : ""}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto bg-background">
                <SheetHeader>
                  <SheetTitle className="sr-only">Filters</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">{panel}</div>
                <div className="sticky bottom-0 border-t bg-background p-4">
                  <Button className="w-full" onClick={() => setMobileOpen(false)}>
                    Show {results.length} profiles
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-44">
              <NativeSelect
                aria-label="Sort profiles"
                value={sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
                options={[
                  { value: "newest", label: "Newest first" },
                  { value: "age-asc", label: "Age: youngest" },
                  { value: "age-desc", label: "Age: oldest" },
                  { value: "completion", label: "Most complete" },
                ]}
              />
            </div>
            <div className="flex rounded-md border bg-card p-0.5" role="group" aria-label="Layout">
              {(["grid", "list"] as const).map((v) => {
                const Icon = v === "grid" ? LayoutGrid : List;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-label={`${v} view`}
                    aria-pressed={view === v}
                    onClick={() => update({ view: v })}
                    className={cn(
                      "flex h-8 w-9 cursor-pointer items-center justify-center rounded",
                      view === v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {!hydrated ? (
            <CardsSkeleton />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
                Showing <strong className="text-foreground">{results.length}</strong>{" "}
                {results.length === 1 ? "profile" : "profiles"}
              </p>
              {results.length === 0 ? (
                <EmptyState
                  icon={UserX}
                  title="No profiles match these filters"
                  text="Try widening the age range or removing a filter."
                  action={<Button onClick={clear}>Clear all filters</Button>}
                />
              ) : (
                <div
                  className={
                    view === "grid"
                      ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-4"
                  }
                >
                  {results.map((p) => (
                    <ProfileCard
                      key={p.id}
                      profile={p}
                      layout={view}
                      compat={
                        myProfile && myProfile.gender !== p.gender
                          ? compatibility(myProfile, p).score
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function ProfilesPage() {
  return (
    <Suspense fallback={<CardsSkeleton />}>
      <ProfilesContent />
    </Suspense>
  );
}
