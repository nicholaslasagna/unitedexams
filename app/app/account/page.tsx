"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UniversityOption {
  id: string;
  name: string;
}

export default function AccountPage() {
  const { profile, saveProfile, user, supabase } = useAppData();
  const { push } = useToast();

  const [displayName, setDisplayName] = useState(profile.name || "");
  const [realName, setRealName] = useState(profile.realName || "");
  const [showRealName, setShowRealName] = useState(Boolean(profile.showRealName));
  const [showUniversity, setShowUniversity] = useState(Boolean(profile.showUniversity));
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | undefined>(profile.universityId);

  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [search, setSearch] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedUniversity = useMemo(
    () => universities.find((item) => item.id === selectedUniversityId),
    [universities, selectedUniversityId]
  );

  const filteredUniversities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return universities.slice(0, 12);
    return universities.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 12);
  }, [universities, search]);

  useEffect(() => {
    setDisplayName(profile.name || "");
    setRealName(profile.realName || "");
    setShowRealName(Boolean(profile.showRealName));
    setShowUniversity(Boolean(profile.showUniversity));
    setSelectedUniversityId(profile.universityId);
  }, [profile]);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from("universities")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => {
        setUniversities((data as UniversityOption[]) ?? []);
      });
  }, [supabase]);

  const addUniversity = async () => {
    if (!supabase) return;
    const name = search.trim();
    if (!name) return;

    const { data, error } = await supabase
      .from("universities")
      .insert({ name })
      .select("id, name")
      .single();

    if (error || !data) {
      push({ title: "Could not add university", description: error?.message, tone: "error" });
      return;
    }

    setUniversities((prev) => [...prev, data as UniversityOption].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedUniversityId(data.id);
    setSearch("");
    setOpenPicker(false);
    push({ title: "University added", tone: "success" });
  };

  const saveAccount = async () => {
    setSaving(true);
    await saveProfile({
      ...profile,
      name: displayName.trim() || "Student",
      realName: realName.trim() || undefined,
      showRealName,
      showUniversity,
      universityId: selectedUniversityId
    });
    setSaving(false);
    push({ title: "Account updated", tone: "success" });
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-sm text-muted">Profile, identity visibility, and leaderboard privacy settings.</p>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Display name</label>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Real name (optional)</label>
              <Input value={realName} onChange={(event) => setRealName(event.target.value)} placeholder="Your legal/full name" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Email</label>
            <Input value={user?.email || profile.email || ""} readOnly className="opacity-80" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">University</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker((prev) => !prev)}
                className="flex h-11 w-full items-center justify-between rounded-[10px] border border-white/[0.07] bg-white/[0.035] px-3.5 text-sm text-left text-text"
                aria-expanded={openPicker}
              >
                <span>{selectedUniversity?.name || "Select university"}</span>
                <ChevronsUpDown className="h-4 w-4 text-muted" />
              </button>

              {openPicker ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/[0.1] bg-[rgba(8,10,30,0.96)] shadow-elevated backdrop-blur-xl">
                  <div className="p-2">
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search university"
                    />
                  </div>
                  <div className="max-h-56 overflow-auto px-2 pb-2">
                    {filteredUniversities.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedUniversityId(item.id);
                          setSearch("");
                          setOpenPicker(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-text hover:bg-white/[0.06]"
                      >
                        <span>{item.name}</span>
                        <Check className={cn("h-4 w-4", selectedUniversityId === item.id ? "text-success" : "opacity-0")} />
                      </button>
                    ))}

                    {search.trim().length > 1 && !universities.some((item) => item.name.toLowerCase() === search.trim().toLowerCase()) ? (
                      <button
                        type="button"
                        onClick={addUniversity}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg border border-brand-2/35 bg-brand-2/10 px-2 py-2 text-left text-sm font-semibold text-brand-2 hover:bg-brand-2/15"
                      >
                        <Plus className="h-4 w-4" />
                        Add &quot;{search.trim()}&quot;
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
              <span>
                <span className="block text-sm font-semibold text-text">Show my real name on leaderboard</span>
                <span className="text-xs text-muted">Only shown if enabled.</span>
              </span>
              <input
                type="checkbox"
                checked={showRealName}
                onChange={(event) => setShowRealName(event.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--brand-2))]"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
              <span>
                <span className="block text-sm font-semibold text-text">Show my university on leaderboard</span>
                <span className="text-xs text-muted">Controlled by your privacy preference.</span>
              </span>
              <input
                type="checkbox"
                checked={showUniversity}
                onChange={(event) => setShowUniversity(event.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--brand-2))]"
              />
            </label>
          </div>

          <div className="pt-1">
            <Button onClick={saveAccount} loading={saving}>
              Save account settings
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
