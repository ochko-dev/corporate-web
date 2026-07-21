import { cn } from "@/lib/utils";
import LogoIcon from "@/components/icons/Logo"; // your SVG component

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <LogoIcon />
      {/* <span>Odin</span> */}
    </span>
  );
}