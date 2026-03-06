import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { ConstellationPattern } from "@/components/ui/constellation-pattern";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <NavigationProgress />
      <div className="ambient-glow" />
      <ConstellationPattern className="fixed" opacity={0.025} variant="sparse" />

      <Sidebar />

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main"
          className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-5 pb-28 sm:px-5 md:px-8 md:py-8 lg:px-10 lg:pb-10"
        >
          <div className="animate-fade-in">{children}</div>
        </main>
        <footer className="mx-auto w-full max-w-[1360px] border-t border-borderc px-4 py-5 pb-28 text-center text-sm text-muted sm:px-5 md:px-8 lg:pb-4">
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
