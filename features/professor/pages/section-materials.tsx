"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import {
  createSectionMaterial,
  deleteSectionMaterial,
  listProfessorSections,
  listSectionMaterials,
  type SectionMaterialRow,
  type SectionSummary
} from "@/features/professor/api";

const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;

type AttachmentUploadStatus = "queued" | "uploading" | "uploaded" | "error";

interface PendingAttachment {
  id: string;
  file: File;
  status: AttachmentUploadStatus;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateAttachmentFile(file: File) {
  if (file.type !== "application/pdf") {
    return "Only PDF attachments are supported.";
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `File exceeds ${formatBytes(MAX_ATTACHMENT_BYTES)} limit.`;
  }
  return null;
}

export function ProfessorSectionMaterialsPage({ sectionId }: { sectionId?: string } = {}) {
  const params = useParams<{ id?: string; sectionId?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";
  const { supabase, user, profile } = useAppData();
  const { push } = useToast();
  const isProfessor = isVerifiedProfessor(profile);

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [materials, setMaterials] = useState<SectionMaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const appendFiles = (files: File[]) => {
    if (files.length === 0) return;
    const mapped = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "queued" as const,
      progress: 0,
      error: validateAttachmentFile(file),
      uploadedUrl: null
    }));
    setPendingAttachments((prev) => [...prev, ...mapped]);
  };

  const updateAttachment = (id: string, patch: Partial<PendingAttachment>) => {
    setPendingAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const refresh = async () => {
    if (!supabase || !resolvedSectionId) return;
    setLoading(true);
    try {
      const [sections, rows] = await Promise.all([
        listProfessorSections(supabase),
        listSectionMaterials(supabase, resolvedSectionId)
      ]);
      setSection(sections.find((item) => item.id === resolvedSectionId) ?? null);
      setMaterials(rows);
    } catch {
      setSection(null);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase || !resolvedSectionId) {
      setLoading(false);
      return;
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSectionId, supabase]);

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading materials…</CardBody>
      </Card>
    );
  }

  if (!section) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Section not found.</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Section Materials</h1>
          <p className="mt-2 text-sm text-muted">{section.name}</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/app/sections/${resolvedSectionId}`}>Back to section</Link>
        </Button>
      </section>

      {isProfessor ? (
        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Post material</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Title</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Week 4 notes" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Body (markdown)</label>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="min-h-36 w-full rounded-[10px] border border-borderc bg-soft px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                placeholder="Upload summary notes, derivations, and references."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Attachment URL (optional)</label>
              <Input
                value={attachmentUrl}
                onChange={(event) => setAttachmentUrl(event.target.value)}
                placeholder="https://.../notes.pdf"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Add section attachments</label>
              <div
                className={`rounded-xl border border-dashed px-4 py-6 text-sm transition ${dragActive ? "border-accent bg-accent/10" : "border-borderc bg-soft"}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  appendFiles(Array.from(event.dataTransfer.files));
                }}
              >
                <div className="space-y-2 text-center">
                  <p className="font-semibold text-text">Drag and drop PDF files here</p>
                  <p className="text-xs text-muted">or</p>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-borderc bg-surface px-3 py-2 text-xs font-semibold text-text hover:border-accent">
                    Select PDF files
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        appendFiles(Array.from(event.target.files ?? []));
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <p className="text-xs text-muted">PDF only • max {formatBytes(MAX_ATTACHMENT_BYTES)} each</p>
                </div>
              </div>

              {pendingAttachments.length > 0 ? (
                <div className="space-y-2">
                  {pendingAttachments.map((item) => (
                    <div key={item.id} className="rounded-lg border border-borderc bg-surface p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">{item.file.name}</p>
                          <p className="text-xs text-muted">
                            {formatBytes(item.file.size)} • {item.status}
                          </p>
                          {item.error ? <p className="mt-1 text-xs text-danger">{item.error}</p> : null}
                        </div>
                        <Button
                          variant="ghost"
                          disabled={publishing && item.status === "uploading"}
                          onClick={() =>
                            setPendingAttachments((prev) => prev.filter((entry) => entry.id !== item.id))
                          }
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="mt-2 h-2 w-full rounded-full bg-soft">
                        <div
                          className={`h-full rounded-full transition-all ${item.error ? "bg-danger" : "bg-accent"}`}
                          style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{Math.round(item.progress)}%</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <Button
              loading={publishing}
              onClick={async () => {
                if (!supabase || !user) return;
                if (!title.trim()) {
                  push({ title: "Title is required", tone: "error" });
                  return;
                }

                setPublishing(true);
                try {
                  const attachments: string[] = [];
                  if (attachmentUrl.trim()) {
                    attachments.push(attachmentUrl.trim());
                  }

                  const invalidAttachment = pendingAttachments.find((item) => item.error);
                  if (invalidAttachment) {
                    throw new Error(`Fix attachment issue: ${invalidAttachment.error}`);
                  }

                  for (const item of pendingAttachments) {
                    if (item.uploadedUrl) {
                      attachments.push(item.uploadedUrl);
                      continue;
                    }

                    const ext = item.file.name.split(".").pop()?.toLowerCase() || "pdf";
                    const safeExt = ext === "pdf" ? ext : "pdf";
                    const path = `${resolvedSectionId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

                    updateAttachment(item.id, { status: "uploading", progress: 5, error: null });
                    const progressTimer = window.setInterval(() => {
                      setPendingAttachments((prev) =>
                        prev.map((entry) => {
                          if (entry.id !== item.id || entry.status !== "uploading") return entry;
                          return {
                            ...entry,
                            progress: Math.min(95, entry.progress + Math.random() * 18)
                          };
                        })
                      );
                    }, 180);

                    const { error: uploadError } = await supabase.storage
                      .from("section-materials")
                      .upload(path, item.file, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: "application/pdf"
                      });

                    window.clearInterval(progressTimer);

                    if (uploadError) {
                      const message = (uploadError.message ?? "").toLowerCase();
                      if (message.includes("bucket not found")) {
                        updateAttachment(item.id, {
                          status: "error",
                          error: "Missing section-materials bucket",
                          progress: 0
                        });
                        throw new Error(
                          "Storage bucket section-materials is missing. Apply the latest Supabase migration and try again."
                        );
                      }
                      updateAttachment(item.id, {
                        status: "error",
                        error: uploadError.message ?? "Upload failed",
                        progress: 0
                      });
                      throw uploadError;
                    }

                    const { data: urlData } = supabase.storage.from("section-materials").getPublicUrl(path);
                    if (urlData?.publicUrl) {
                      attachments.push(urlData.publicUrl);
                      updateAttachment(item.id, {
                        status: "uploaded",
                        uploadedUrl: urlData.publicUrl,
                        progress: 100
                      });
                    } else {
                      updateAttachment(item.id, {
                        status: "error",
                        error: "Uploaded but no public URL returned.",
                        progress: 0
                      });
                      throw new Error("Attachment URL generation failed.");
                    }
                  }

                  await createSectionMaterial(supabase, {
                    sectionId: resolvedSectionId,
                    title: title.trim(),
                    bodyMd: body.trim(),
                    attachments,
                    createdBy: user.id
                  });
                  setTitle("");
                  setBody("");
                  setAttachmentUrl("");
                  setPendingAttachments([]);
                  push({ title: "Material posted", tone: "success" });
                  await refresh();
                } catch (error) {
                  push({ title: "Unable to post material", description: (error as Error).message, tone: "error" });
                } finally {
                  setPublishing(false);
                }
              }}
            >
              Publish material
            </Button>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Published materials</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {materials.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted">
              No materials posted yet.
            </p>
          ) : (
            materials.map((material) => (
              <article key={material.id} className="rounded-xl border border-borderc bg-soft px-4 py-3">
                <h3 className="text-base font-semibold text-text">{material.title}</h3>
                {material.body_md ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{material.body_md}</p>
                ) : null}
                {material.attachments.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {material.attachments.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-borderc bg-surface px-2 py-1 text-xs font-semibold text-accent hover:text-text"
                      >
                        Open attachment
                      </a>
                    ))}
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-muted">Posted {new Date(material.created_at).toLocaleString()}</p>
                {isProfessor ? (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        if (!supabase) return;
                        try {
                          await deleteSectionMaterial(supabase, material.id);
                          push({ title: "Material removed", tone: "success" });
                          await refresh();
                        } catch (error) {
                          push({ title: "Unable to remove material", description: (error as Error).message, tone: "error" });
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
