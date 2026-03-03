import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,hsl(var(--layer-1)/0.96),hsl(var(--layer-0)))]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1360px] flex-1 px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
