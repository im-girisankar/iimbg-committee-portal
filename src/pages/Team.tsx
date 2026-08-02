import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTeam } from "../lib/api";
import type { TeamMember } from "../lib/schemas";
import TeamCard from "../components/TeamCard";

/* ─────────────────────────────────────────────────────────────
   Team page — Envision Entrepreneurship Cell team.
   Clean grid with staggered fade-up animations.
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
      <div className="pt-24 pb-20 px-4 bg-background">
        <div className="mx-auto max-w-[1120px]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="animate-pulse space-y-6"
          >
            <motion.div className="h-10 bg-background rounded w-1/4" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="bg-surface border border-border rounded-2xl h-80"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 bg-background">
      <div className="mx-auto max-w-[1120px]">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display font-bold text-3xl md:text-4xl text-primary mb-2">
            The Team
          </h1>
          <p className="text-secondary">
            The people driving Envision's mission to build the next generation of founders.
          </p>
        </motion.header>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          aria-label="Team members"
        >
          {members.map((member, i) => (
            <motion.div key={member.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
              <TeamCard member={member} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}