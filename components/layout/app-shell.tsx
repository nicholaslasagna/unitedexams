import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceNavigationProvider } from "@/components/layout/workspace-navigation-context";
import { NavigationProgress } from "@/components/layout/navigation-progress";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-bg">
      <NavigationProgress />

      {/* Flowing colorful backdrop — same family as the sign-in page,
          quieter so it never competes with content. Replaces the
          previous ambient-glow + constellation pattern combo. The
          aurora is fixed-position with z-index 0; sidebar/topbar/main
          all sit at z-index 1 via the wrapper below. */}
      <div className="page-aurora" aria-hidden />

      <WorkspaceNavigationProvider>
        <Sidebar />

        <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main
            id="main"
            /*
             * tabIndex -1 makes the skip link actually work. Without it the
             * browser scrolls to #main but leaves focus on the link itself,
             * so the very next Tab drops the user back into the header nav -
             * exactly what they used the skip link to avoid.
             */
            tabIndex={-1}
            className="focus:outline-none mx-auto w-full max-w-[1360px] flex-1 px-4 py-5 pb-28 sm:px-5 md:px-8 md:py-8 lg:px-10 lg:pb-10"
          >
            <div className="animate-fade-in">{children}</div>
          </main>
          <footer className="mx-auto w-full max-w-[1360px] border-t border-borderc/70 px-4 py-5 pb-28 text-center text-sm text-muted sm:px-5 md:px-8 lg:pb-4">
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
      </WorkspaceNavigationProvider>
    </div>
  );
}
