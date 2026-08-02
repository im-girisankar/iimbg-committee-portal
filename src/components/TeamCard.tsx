import type { TeamMember } from "../lib/schemas";

/* ─────────────────────────────────────────────────────────────
   TeamCard — avatar (DiceBear initials), name, mono role, bio.
   ───────────────────────────────────────────────────────────── */

interface Props {
  member: TeamMember;
  index?: number;
}

export default function TeamCard({ member, index = 0 }: Props) {
  const style = index > 0 ? { animationDelay: `${Math.min(index, 12) * 60}ms` } : {};

  return (
    <article
      className="group bg-[#1C1915] border border-[#322C24] rounded-xl overflow-hidden transition-all hover:border-[#C9A227]/50 hover:shadow-[0_0_0_1px_#C9A227] flex flex-col h-full animate-fade-up"
      style={style}
    >
      {/* Avatar */}
      <div className="aspect-square relative bg-[#241F19]">
        <img
          src={member.avatar}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-display font-semibold text-[#F2EDE3] mb-1">
          {member.name}
        </h3>
        <p className="mono text-sm mb-3">{member.role}</p>
        <p className="text-sm text-[#9C948A] flex-1">{member.bio}</p>

        {/* Vertical badge */}
        <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium bg-[#241F19] text-[#6B7F5E] border border-[#6B7F5E]/30 rounded-full">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {member.vertical}
        </span>
      </div>
    </article>
  );
}