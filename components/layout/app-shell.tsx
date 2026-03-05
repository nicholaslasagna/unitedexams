import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { ConstellationPattern } from "@/components/ui/constellation-pattern";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Navigation progress bar */}
      <NavigationProgress />

      {/* Ambient glow — atmospheric background */}
      <div className="ambient-glow" />

      {/* Constellation pattern — structural decoration */}
      <ConstellationPattern className="fixed" opacity={0.025} variant="sparse" />

      <Sidebar />

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="mx-auto w-full max-w-[1360px] flex-1 px-5 py-8 md:px-8 lg:px-10">
          <div className="animate-fade-in">{children}</div>
        </main>
        <footer className="mx-auto w-full max-w-[1360px] border-t border-borderc px-5 py-4 text-center text-sm text-muted md:px-8">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://imagicaststudios.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent transition-colors duration-150 hover:text-text"
          >
            Imagicast Studios
          </a>
        </footer>
      </div>
    </div>
  );
}
