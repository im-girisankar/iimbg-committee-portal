import type { TeamMember } from "../lib/schemas";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   TeamCard — avatar (DiceBear initials), name, mono role, bio.
   ───────────────────────────────────────────────────────────── */

interface Props {
  member: TeamMember;
  index?: number;
}

export default function TeamCard({ member, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-hover)] flex flex-col h-full"
    >
      {/* Avatar */}
      <div className="aspect-square relative bg-[var(--color-background)]">
        <img
          src={member.avatar}
          alt=""
          className="w-full h-full object-cover rounded-t-2xl"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-display font-semibold text-[var(--color-primary)] mb-1">
          {member.name}
        </h3>
        <p className="mono text-sm text-[var(--color-accent)] mb-3">{member.role}</p>
        <p className="text-sm text-[var(--color-secondary)] flex-1">{member.bio}</p>

        {/* Vertical badge */}
        <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-accent)] rounded-full">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {member.vertical}
        </span>
      </div>
    </motion.article>
  );
}