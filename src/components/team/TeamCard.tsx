import Image from "next/image";
import LogoMark from "../icons/Logo";
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

export function TeamCard({ member, position, firstName, lastName }: TeamCardProps) {
  const { image, initials } = member;
  const fullLastName = lastName ?? "";

  return (
    <div className="group relative h-full">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-cyan/30 to-brand-indigo/20 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/40 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-primary/40">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {image ? (
            <>
              <Image
                src={image}
                alt={`${firstName} ${fullLastName}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover grayscale transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.03]">
              <span className="font-serif text-5xl font-normal text-muted-foreground/40 italic">
                {initials}
              </span>
            </div>
          )}
        </div>

        <div className="relative flex flex-1 flex-col items-center gap-3 overflow-hidden px-6 py-7 text-center">
          <div
            className="pointer-events-none absolute inset-0 flex scale-600 items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-10"
            aria-hidden
          >
            <LogoMark />
          </div>

          <div className="relative z-10">
            <p className="text-2xl font-semibold tracking-tight text-foreground uppercase">
              {firstName}
            </p>
            {fullLastName ? (
              <p className="mt-1 text-sm font-medium tracking-wide text-muted-foreground uppercase">
                {fullLastName}
              </p>
            ) : null}
          </div>
          <span className="relative z-10 h-px w-8 bg-border/70" />
          <p className="relative z-10 text-xs font-medium tracking-[0.18em] text-muted-foreground/80 uppercase transition-colors duration-300 group-hover:text-primary">
            {position}
          </p>
        </div>
      </div>
    </div>
  );
}
