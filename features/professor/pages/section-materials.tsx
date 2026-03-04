"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import {
  createSectionMaterial,
  deleteSectionMaterial,
  listProfessorSections,
  listSectionMaterials,
  type SectionMaterialRow,
  type SectionSummary
} from "@/features/professor/api";

export function ProfessorSectionMaterialsPage({ sectionId }: { sectionId?: string } = {}) {
  const params = useParams<{ id?: string; sectionId?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";
  const { supabase, user, profile } = useAppData();
  const { push } = useToast();
  const isProfessor = profile.role === "professor" || profile.role === "admin";

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [materials, setMaterials] = useState<SectionMaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

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
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Upload PDF (optional)</label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(event) => setMaterialFile(event.target.files?.[0] ?? null)}
              />
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

                  if (materialFile) {
                    const ext = materialFile.name.split(".").pop()?.toLowerCase() || "pdf";
                    const safeExt = ext === "pdf" ? ext : "pdf";
                    const path = `${resolvedSectionId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

                    const { error: uploadError } = await supabase.storage
                      .from("section-materials")
                      .upload(path, materialFile, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: "application/pdf"
                      });

                    if (uploadError) {
                      throw uploadError;
                    }

                    const { data: urlData } = supabase.storage.from("section-materials").getPublicUrl(path);
                    if (urlData?.publicUrl) {
                      attachments.push(urlData.publicUrl);
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
                  setMaterialFile(null);
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
