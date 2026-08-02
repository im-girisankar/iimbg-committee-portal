import { useEffect, useState } from "react";
import { getTeam } from "../lib/api";
import type { TeamMember } from "../lib/schemas";
import TeamCard from "../components/TeamCard";

/* ─────────────────────────────────────────────────────────────
   Team page — same grid pattern, member cards with avatar + role.
   ───────────────────────────────────────────────────────────── */

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeam().then((m) => {
      setMembers(m);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4">
        <div className="mx-auto max-w-[1120px]">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-[#1C1915] rounded w-1/4" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="bg-[#1C1915] border border-[#322C24] rounded-xl h-80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-10">
          <h1 className="text-3xl font-display font-bold text-[#F2EDE3] mb-2">
            The Team
          </h1>
          <p className="text-[#9C948A]">
            The people keeping the campus's tech running.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label="Team members">
          {members.map((member, i) => (
            <TeamCard key={member.id} member={member} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}