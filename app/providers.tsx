"use client";

import type { ReactNode } from "react";
import { AppDataProvider } from "@/lib/app-data-context";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppDataProvider>
      <ToastProvider>{children}</ToastProvider>
    </AppDataProvider>
  );
}
