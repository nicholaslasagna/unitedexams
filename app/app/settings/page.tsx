"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";

export default function SettingsPage() {
  const { profile, preferences, savePreferences, saveProfile, exportData, importData } = useAppData();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name || "");
  const [school, setSchool] = useState(profile.school || "");

  const onExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `united-exams-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(href);
    push({ title: "Data export created", tone: "success" });
  };

  const onImportClick = () => {
    fileRef.current?.click();
  };

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      push({ title: "Data imported successfully", tone: "success" });
    } catch {
      push({ title: "Import failed", description: "Please use a valid export JSON file.", tone: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted">Theme controls, accessibility, profile basics, and local data portability.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Account basics</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">School (optional)</label>
              <Input value={school} onChange={(event) => setSchool(event.target.value)} placeholder="University / College" />
            </div>
            <Button
              onClick={async () => {
                await saveProfile({ name: name.trim() || "Student", school: school.trim() || undefined });
                push({ title: "Profile updated", tone: "success" });
              }}
            >
              Save profile
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Appearance & accessibility</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-sm font-semibold text-text">Theme</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                      preferences.theme === theme
                        ? "border-brand-2/55 bg-brand-2/10 text-text"
                        : "border-borderc text-muted"
                    }`}
                    onClick={() => savePreferences({ ...preferences, theme })}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
              <span>
                <span className="block text-sm font-semibold text-text">Reduced motion</span>
                <span className="text-xs text-muted">Respect animations/motion preference.</span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                checked={preferences.reducedMotion}
                onChange={(event) => savePreferences({ ...preferences, reducedMotion: event.target.checked })}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
              <span>
                <span className="block text-sm font-semibold text-text">Celebration confetti</span>
                <span className="text-xs text-muted">Only for personal best milestones.</span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                checked={preferences.confettiEnabled}
                onChange={(event) => savePreferences({ ...preferences, confettiEnabled: event.target.checked })}
              />
            </label>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Data portability</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-muted">Export your local progress as JSON or import it on another machine.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onExport}>
              <Download className="h-4 w-4" />
              Export data
            </Button>
            <Button variant="ghost" onClick={onImportClick}>
              <Upload className="h-4 w-4" />
              Import data
            </Button>
            <input ref={fileRef} type="file" accept="application/json" onChange={onImportFile} className="hidden" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
