import { cn } from "@/lib/cn";
import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMember } from "@/lib/schemas";

interface TeamCardProps {
  member: TeamMember;
  /** `lg` is used for the 2-up leadership row; everyone else stays `default`. */
  size?: "default" | "lg";
}

/**
 * Deletes the duplicate `vertical` badge outright (D9). In team.json `role`
 * and `vertical` are identical strings for every member, so the old badge
 * only ever repeated the role line in a pill. `vertical` earns its place
 * instead as the grouping key the page (`pages/Team.tsx`) reads.
 *
 * Non-interactive: no hover state, no shadow. The old card faked an
 * affordance with a hover elevation whose shadow token was
 * never defined (D12) — do not reintroduce it.
 */
export function TeamCard({ member, size = "default" }: TeamCardProps) {
  const dimension = size === "lg" ? 72 : 56;

  return (
    <Card className="h-full">
      <CardBody padding="compact" className="flex h-full items-start gap-4">
        <img
          src={member.avatar}
          alt={member.name}
          width={dimension}
          height={dimension}
          loading="lazy"
          decoding="async"
          className={cn(
            "shrink-0 rounded-full object-cover",
            size === "lg" ? "size-[72px]" : "size-14",
          )}
        />
        <div className="min-w-0">
          <h3 className="truncate text-title-4 text-fg">{member.name}</h3>
          <p className="text-caption text-brand-text">{member.role}</p>
          <p className="mt-1 line-clamp-2 text-caption text-fg-muted">{member.bio}</p>
        </div>
      </CardBody>
    </Card>
  );
}

/** Shaped skeleton matching `TeamCard`'s box so loading never jumps (D15). */
export function TeamCardSkeleton({ size = "default" }: { size?: "default" | "lg" }) {
  return (
    <Card className="h-full">
      <CardBody padding="compact" className="flex items-start gap-4">
        <Skeleton className={cn("shrink-0 rounded-full", size === "lg" ? "size-[72px]" : "size-14")} />
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-[15px] w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </CardBody>
    </Card>
  );
}
