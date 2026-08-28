import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One navigation row, used by both the in-app sidebar and the public
 * sidebar.
 *
 * Shared rather than copied so the two cannot look different: the padding,
 * the active pill, the accent dot and the icon colour are defined once here.
 */
export function NavRow({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
  mobile = false
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        mobile
          ? "group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-150 ease-out-expo"
          : "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150 ease-out-expo",
        active ? "bg-accent-subtle text-text" : "text-faint hover:bg-soft hover:text-muted"
      )}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.4)]"
          aria-hidden
        />
      ) : null}
      <Icon
        className={cn(
          mobile ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]",
          active ? "text-accent" : "text-faint group-hover:text-muted"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

/** The small uppercase group heading the sidebar uses ("Study tools", "You"). */
export function NavGroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">{children}</p>
  );
}

/** The brand mark that sits at the top of every shell. */
export function NavWordmark({
  className,
  size = 18
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-baseline gap-2 rounded-md px-2 py-2 transition-opacity duration-150 hover:opacity-80",
        className
      )}
    >
      <span
        className="font-wordmark font-bold leading-none tracking-[-0.02em] text-text"
        style={{ fontSize: `${size}px` }}
      >
        United{" "}
        <em className="font-display font-medium not-italic text-accent">
          <span className="italic">Exams</span>
        </em>
      </span>
    </Link>
  );
}
