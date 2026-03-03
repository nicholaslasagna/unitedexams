import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#050510]">
      {/* Ambient glow — atmospheric background from quiz */}
      <div className="ambient-glow" />
      <Sidebar />
      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1360px] flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
