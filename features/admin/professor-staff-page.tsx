"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { isUniversityAdmin } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import {
  getManagedProfessors,
  getProfessorVerificationCodeStatus,
  rotateProfessorVerificationCode,
  setManagedProfessorVerification,
  type ManagedProfessorRow,
  type ProfessorCodeStatusRow
} from "@/features/admin/api";

export function ProfessorStaffAdminPage() {
  const { profile, supabase } = useAppData();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState(false);
  const [savingProfessorId, setSavingProfessorId] = useState<string | null>(null);
  const [status, setStatus] = useState<ProfessorCodeStatusRow | null>(null);
  const [professors, setProfessors] = useState<ManagedProfessorRow[]>([]);
  const [nextCode, setNextCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const isAdmin = isUniversityAdmin(profile);

  const sortedProfessors = useMemo(
    () => [...professors].sort((a, b) => a.display_name.localeCompare(b.display_name)),
    [professors]
  );

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [nextStatus, nextProfessors] = await Promise.all([
        getProfessorVerificationCodeStatus(supabase),
        getManagedProfessors(supabase)
      ]);
      setStatus(nextStatus);
      setProfessors(nextProfessors);
    } catch (error) {
      push({
        title: "Unable to load professor staff",
        description: (error as Error).message,
        tone: "error"
      });
      setStatus(null);
      setProfessors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, supabase]);

  if (!isAdmin) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">
          University-admin access required.
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-semibold tracking-tight">Professor Staff</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Manage teacher verification for your university only.
        </p>
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Verification Code</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-text-secondary">
            University: <span className="font-semibold text-text">{status?.university_name || "Not configured"}</span>
          </p>
          <p className="text-sm text-text-secondary">
            Active code: {status?.has_active_code ? "Yes" : "No"}
            {status?.expires_at ? ` · Expires ${new Date(status.expires_at).toLocaleString()}` : ""}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={nextCode}
              onChange={(event) => setNextCode(event.target.value.toUpperCase())}
              placeholder="Set new professor signup code"
              maxLength={48}
            />
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>
          <Button
            loading={savingCode}
            onClick={async () => {
              if (!supabase) return;
              if (nextCode.trim().length < 8) {
                push({
                  title: "Code must be at least 8 characters",
                  tone: "error"
                });
                return;
              }
              setSavingCode(true);
              try {
                await rotateProfessorVerificationCode(supabase, {
                  code: nextCode.trim(),
                  expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
                });
                setNextCode("");
                push({
                  title: "Professor verification code updated",
                  tone: "success"
                });
                await refresh();
              } catch (error) {
                push({
                  title: "Unable to rotate code",
                  description: (error as Error).message,
                  tone: "error"
                });
              } finally {
                setSavingCode(false);
              }
            }}
          >
            Save code
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Professors</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted">Loading professor staff…</p>
          ) : sortedProfessors.length === 0 ? (
            <p className="text-sm text-muted">No professor accounts found for this university.</p>
          ) : (
            sortedProfessors.map((professor) => (
              <div
                key={professor.professor_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borderc bg-soft px-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-text">{professor.display_name}</p>
                  <p className="text-xs text-muted">
                    {professor.email || "No email"}
                    {professor.professor_verified
                      ? ` · Verified ${professor.professor_verified_at ? new Date(professor.professor_verified_at).toLocaleString() : ""}`
                      : " · Not verified"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={savingProfessorId === professor.professor_id}
                    onClick={async () => {
                      if (!supabase) return;
                      setSavingProfessorId(professor.professor_id);
                      try {
                        await setManagedProfessorVerification(supabase, {
                          professorId: professor.professor_id,
                          approved: !professor.professor_verified
                        });
                        push({
                          title: professor.professor_verified
                            ? "Professor access revoked"
                            : "Professor approved",
                          tone: "success"
                        });
                        await refresh();
                      } catch (error) {
                        push({
                          title: "Unable to update professor status",
                          description: (error as Error).message,
                          tone: "error"
                        });
                      } finally {
                        setSavingProfessorId(null);
                      }
                    }}
                  >
                    {professor.professor_verified ? "Revoke" : "Approve"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
