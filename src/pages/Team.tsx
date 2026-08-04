import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/app/page-header";
import { TeamCard, TeamCardSkeleton } from "@/components/app/team-card";
import { useDelayedLoading } from "@/lib/use-delayed-loading";
import { getTeam } from "@/lib/api";
import type { TeamMember } from "@/lib/schemas";

// The first two entries in team.json are President and Vice President — the
// spec ("04-PAGES.md §P3") calls these out as a distinct 2-up leadership row.
const LEADERSHIP_COUNT = 2;
const ROSTER_SKELETON_COUNT = 12 - LEADERSHIP_COUNT;

const leadershipGrid = "grid grid-cols-1 gap-4 sm:grid-cols-2";
const rosterGrid = "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";
const groupHeading = "border-t border-border pt-3 text-micro uppercase text-fg-subtle";

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);

  useEffect(() => {
    let cancelled = false;
    getTeam().then((data) => {
      if (cancelled) return;
      setMembers(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const leadership = members.slice(0, LEADERSHIP_COUNT);
  // `vertical` is unique per member in team.json today, so grouping strictly
  // by that field would produce ten one-person sections — reading the data
  // faithfully, not inventing categories to fill it out. Rather than render
  // ten single-item headings (worse than the flat grid it replaces), the
  // remaining members render as one ungrouped roster below the leadership
  // row. If verticals ever diverge into real categories, this still reads
  // correctly since it never hardcodes a member.
  const roster = members.slice(LEADERSHIP_COUNT);

  return (
    <div className="container-page pt-10 pb-16 lg:pt-14 lg:pb-24">
      <PageHeader title="Team" subtitle="The people building Envision at IIM Bodh Gaya." />

      {showSkeleton && (
        <>
          <ul className={leadershipGrid} aria-hidden="true">
            {Array.from({ length: LEADERSHIP_COUNT }).map((_, i) => (
              <li key={i}>
                <TeamCardSkeleton size="lg" />
              </li>
            ))}
          </ul>
          <ul className={cn(rosterGrid, "mt-10")} aria-hidden="true">
            {Array.from({ length: ROSTER_SKELETON_COUNT }).map((_, i) => (
              <li key={i}>
                <TeamCardSkeleton />
              </li>
            ))}
          </ul>
        </>
      )}

      {!loading && (
        <>
          {leadership.length > 0 && (
            <section>
              <h2 className={groupHeading}>Leadership</h2>
              <ul className={cn(leadershipGrid, "mt-4")} aria-label="Leadership">
                {leadership.map((member) => (
                  <li key={member.id}>
                    <TeamCard member={member} size="lg" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {roster.length > 0 && (
            <section className="mt-10">
              <h2 className={groupHeading}>Team</h2>
              <ul className={cn(rosterGrid, "mt-4")} aria-label="Team members">
                {roster.map((member) => (
                  <li key={member.id}>
                    <TeamCard member={member} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
