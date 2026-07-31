import type { TeamMember } from "@/src/lib/data/team";

interface TeamCardProps {
  member: TeamMember;
  /** Translated label for `member.positionKey`. */
  position: string;
  /** Translated `team.names.<member.id>.firstName`. */
  firstName: string;
  /** Translated `team.names.<member.id>.lastName`, if the member has one. */
  lastName?: string;
}

/** Deterministic bar heights — same id always yields the same signature, so SSR matches client. */
function signatureFor(seed: string, bars = 18) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Array.from({ length: bars }, () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return 22 + ((h >>> 0) % 78);
  });
}

export function TeamCard({ member, position, firstName, lastName }: TeamCardProps) {
  const bars = signatureFor(member.id);

  return (
    <article className="group flex h-full flex-col">
      <div className="flex h-12 items-end gap-[3px]" aria-hidden>
        {bars.map((height, i) => (
          <span
            key={i}
            style={{ height: `${height}%`, transitionDelay: `${i * 30}ms` }}
            className="w-full flex-1 bg-border transition-colors duration-300 ease-out group-hover:bg-primary/70 motion-reduce:transition-none motion-reduce:delay-0"
          />
        ))}
      </div>

      <span className="mt-3 block h-px w-full bg-border/50" aria-hidden />

      <h3 className="mt-6 text-lg leading-[1.2] font-semibold tracking-tight text-balance text-foreground uppercase lg:text-xl">
        {firstName}
      </h3>

      {lastName ? (
        <p className="mt-1.5 text-sm font-normal tracking-[0.16em] text-muted-foreground uppercase">
          {lastName}
        </p>
      ) : null}

      <p className="mt-auto pt-8 font-mono text-[11px] tracking-[0.12em] text-muted-foreground/70 uppercase transition-colors duration-300 ease-out group-hover:text-primary">
        {position}
      </p>
    </article>
  );
}