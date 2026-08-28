"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BellRing, Mail, Send, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import {
  deleteSectionAnnouncement,
  getMyAnnouncements,
  postSectionAnnouncement,
  type AnnouncementFeedItem
} from "@/features/announcements/api";
import { listProfessorSections, type SectionSummary } from "@/features/professor/api";

function announcementPreviewCount(items: AnnouncementFeedItem[]) {
  return new Set(items.map((item) => item.section_id)).size;
}

export function AnnouncementsPageContent() {
  const { supabase, profile } = useAppData();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const [items, setItems] = useState<AnnouncementFeedItem[]>([]);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedSectionId, setFeedSectionId] = useState("all");

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  const isProfessor = isVerifiedProfessor(profile);

  const sectionFromQuery = searchParams.get("section") ?? "";

  const visibleItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (!feedSectionId || feedSectionId === "all") return sorted;
    return sorted.filter((item) => item.section_id === feedSectionId);
  }, [feedSectionId, items]);

  const manageableSectionIds = useMemo(() => new Set(sections.map((section) => section.id)), [sections]);
  const sectionOptions = useMemo(() => {
    const byId = new Map<string, { id: string; label: string }>();

    for (const section of sections) {
      byId.set(section.id, {
        id: section.id,
        label: `${section.name} (${section.course_id})`
      });
    }

    for (const item of items) {
      if (!byId.has(item.section_id)) {
        byId.set(item.section_id, {
          id: item.section_id,
          label: `${item.section_name} (${item.course_id})`
        });
      }
    }

    return Array.from(byId.values());
  }, [items, sections]);
  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? null,
    [sections, selectedSectionId]
  );

  const refresh = async () => {
    if (!supabase) {
      setItems([]);
      setSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [feed, accessibleSections] = await Promise.all([
        getMyAnnouncements(supabase, 120),
        listProfessorSections(supabase)
      ]);
      const accessibleIds = new Set([
        ...accessibleSections.map((section) => section.id),
        ...feed.map((item) => item.section_id)
      ]);

      setItems(feed);
      setSections(accessibleSections);

      if (isProfessor) {
        setSelectedSectionId((current) => {
          if (current && accessibleSections.some((row) => row.id === current)) return current;
          if (sectionFromQuery && accessibleSections.some((row) => row.id === sectionFromQuery)) return sectionFromQuery;
          return accessibleSections[0]?.id ?? "";
        });
      }

      setFeedSectionId((current) => {
        if (current !== "all" && accessibleIds.has(current)) {
          return current;
        }
        if (sectionFromQuery && accessibleIds.has(sectionFromQuery)) {
          return sectionFromQuery;
        }
        return "all";
      });
    } catch (error) {
      setItems([]);
      setSections([]);
      push({
        title: "Unable to load announcements",
        description: (error as Error).message,
        tone: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, isProfessor, sectionFromQuery]);

  const submitAnnouncement = async () => {
    if (!isProfessor) return;
    if (!selectedSectionId) {
      push({ title: "Select a section", tone: "error" });
      return;
    }
    if (title.trim().length < 3) {
      push({ title: "Title must be at least 3 characters", tone: "error" });
      return;
    }
    if (message.trim().length < 4) {
      push({ title: "Message is too short", tone: "error" });
      return;
    }

    setPosting(true);
    try {
      const result = await postSectionAnnouncement({
        sectionId: selectedSectionId,
        title: title.trim(),
        message: message.trim(),
        sendEmail
      });

      setTitle("");
      setMessage("");
      push({
        title: "Announcement posted",
        description: result.warning || undefined,
        tone: result.warning ? "default" : "success"
      });
      await refresh();
    } catch (error) {
      push({
        title: "Unable to post announcement",
        description: (error as Error).message,
        tone: "error"
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">Instructor updates</p>
          <h1 className="text-[1.9rem] font-display font-semibold tracking-tight text-text sm:text-[2.2rem]">Announcements</h1>
          <p className="max-w-[42rem] text-[14px] leading-relaxed text-text-secondary">
            {isProfessor
              ? "Post to one section, decide whether students get an email, and keep the feed tied to the class it belongs to."
              : "Track course-specific updates without digging through unrelated notifications."}
          </p>
        </div>

        <Card>
          <CardBody className="grid gap-2.5 p-3.5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Feed items</p>
              <p className="mt-1 font-mono text-[1.35rem] font-bold leading-none text-text">{items.length}</p>
            </div>
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Sections</p>
              <p className="mt-1 font-mono text-[1.35rem] font-bold leading-none text-text">{announcementPreviewCount(items)}</p>
            </div>
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Mode</p>
              <p className="mt-1 text-[13px] font-semibold text-text">{isProfessor ? "Post + manage" : "Read only"}</p>
            </div>
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3 text-[13px] text-text-secondary">
              Posts stay section-scoped so updates do not bleed across unrelated classes.
            </div>
          </CardBody>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        {isProfessor ? (
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
                  <Send className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-heading font-semibold">Post to a section</h2>
                  <p className="mt-1 text-sm text-text-secondary">Choose the exact section, then decide whether the same message should also go out by email.</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Section</label>
                <select
                  aria-label="Section"
                  value={selectedSectionId}
                  onChange={(event) => setSelectedSectionId(event.target.value)}
                  className="h-11 w-full rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                >
                  {sections.length === 0 ? <option value="">No sections available</option> : null}
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name} ({section.course_id})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSection ? (
                <div className="rounded-[1rem] border border-brand-2/30 bg-brand-2/10 px-4 py-3 text-sm text-text-secondary">
                  Posting to <span className="font-semibold text-text">{selectedSection.name}</span>
                  {selectedSection.term ? ` · ${selectedSection.term}` : ""}.
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Title</label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Exam room changed to ENG 204"
                  maxLength={160}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Message</label>
                <textarea
                  aria-label="Message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-40 w-full rounded-[14px] border border-borderc bg-surface px-3 py-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                  placeholder="Please bring a calculator. Homework 4 is now due Friday at 5 PM."
                />
              </div>

              <label className="flex items-center gap-2 rounded-[1rem] border border-borderc bg-soft px-3 py-3 text-sm text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                  checked={sendEmail}
                  onChange={(event) => setSendEmail(event.target.checked)}
                />
                <Mail className="h-4 w-4 text-brand-2" />
                Email enrolled students in this section
              </label>

              <Button onClick={submitAnnouncement} loading={posting} loadingLabel="Posting announcement...">
                Post announcement
              </Button>
            </CardBody>
          </Card>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-heading font-semibold">Recent announcements</h2>
                <p className="mt-1 text-sm text-text-secondary">Filter by section when you want the feed scoped to one class.</p>
              </div>
              {sectionOptions.length > 0 ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Section filter</label>
                  <select
                    aria-label="Section filter"
                    value={feedSectionId}
                    onChange={(event) => setFeedSectionId(event.target.value)}
                    className="h-10 min-w-64 rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                  >
                    <option value="all">All sections</option>
                    {sectionOptions.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted">Loading announcements…</p>
            ) : visibleItems.length === 0 ? (
              <div className="rounded-[1.1rem] border border-borderc bg-soft p-6 text-sm text-muted">
                No announcements yet. New section updates will appear here.
              </div>
            ) : (
              visibleItems.map((item, idx) => (
                <article
                  key={item.announcement_id}
                  className={`rounded-[1.25rem] border border-borderc bg-soft p-4 transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover stagger-${(idx % 6) + 1}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="brand">{item.course_id}</Badge>
                        <Badge>{item.section_name}</Badge>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-text">{item.title}</p>
                        <p className="mt-1 text-xs text-text-secondary">
                          Posted by {item.posted_by_name} · {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-borderc bg-surface/70 text-brand-2">
                        <BellRing className="h-4 w-4" />
                      </span>
                      {isProfessor && manageableSectionIds.has(item.section_id) ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          loading={deletingId === item.announcement_id}
                          loadingLabel="Removing"
                          disabled={Boolean(deletingId)}
                          onClick={async () => {
                            if (deletingId) return;
                            setDeletingId(item.announcement_id);
                            try {
                              await deleteSectionAnnouncement(item.announcement_id);
                              push({ title: "Announcement removed", tone: "success" });
                              await refresh();
                            } catch (error) {
                              push({
                                title: "Unable to remove announcement",
                                description: (error as Error).message,
                                tone: "error"
                              });
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          aria-label="Remove announcement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 rounded-[1rem] border border-borderc bg-surface/70 p-4 text-sm text-text-secondary">
                    <Markdown content={item.message_md} />
                  </div>
                </article>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
