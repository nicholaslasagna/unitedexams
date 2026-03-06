"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        if (current !== "all" && accessibleSections.some((row) => row.id === current)) {
          return current;
        }
        if (sectionFromQuery && accessibleSections.some((row) => row.id === sectionFromQuery)) {
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
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-semibold tracking-tight">Announcements</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Section updates from your instructors and grade notifications.
        </p>
      </section>

      {isProfessor ? (
        <Card>
          <CardHeader>
            <h2 className="text-heading font-semibold">Post announcement</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Section</label>
                <select
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Title</label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Exam room changed to ENG 204"
                  maxLength={160}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-32 w-full rounded-[10px] border border-borderc bg-surface px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                placeholder="Please bring a calculator. Homework 4 is now due Friday at 5 PM."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                checked={sendEmail}
                onChange={(event) => setSendEmail(event.target.checked)}
              />
              Email enrolled students
            </label>

            <Button onClick={submitAnnouncement} loading={posting}>
              Post announcement
            </Button>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-heading font-semibold">Recent announcements</h2>
            {sections.length > 0 ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Section filter</label>
                <select
                  value={feedSectionId}
                  onChange={(event) => setFeedSectionId(event.target.value)}
                  className="h-10 min-w-64 rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                >
                  <option value="all">All sections</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name} ({section.course_id})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted">Loading announcements…</p>
          ) : visibleItems.length === 0 ? (
            <p className="text-sm text-muted">
              No announcements yet. New section updates will appear here.
            </p>
          ) : (
            visibleItems.map((item) => (
              <article key={item.announcement_id} className="rounded-xl border border-borderc bg-soft p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</span>
                    {isProfessor && manageableSectionIds.has(item.section_id) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={deletingId === item.announcement_id}
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
                <p className="mt-1 text-xs text-muted">
                  {item.section_name} · {item.course_id} · {item.posted_by_name}
                </p>
                <div className="prose prose-sm mt-3 max-w-none text-text prose-p:my-2">
                  <Markdown content={item.message_md} />
                </div>
              </article>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
