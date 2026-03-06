import type { SupabaseClient } from "@supabase/supabase-js";

export interface AnnouncementFeedItem {
  announcement_id: string;
  section_id: string;
  section_name: string;
  course_id: string;
  title: string;
  message_md: string;
  created_at: string;
  posted_by: string;
  posted_by_name: string;
}

export async function getMyAnnouncements(client: SupabaseClient, limit = 100) {
  const { data, error } = await client.rpc("get_my_announcements", {
    limit_count: limit
  });

  if (error) throw error;
  return (data ?? []) as AnnouncementFeedItem[];
}

export async function postSectionAnnouncement(input: {
  sectionId: string;
  title: string;
  message: string;
  sendEmail: boolean;
}) {
  const response = await fetch("/api/sections/announcements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    warning?: string;
    error?: string;
  };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to post announcement right now.");
  }

  return payload;
}

export async function deleteSectionAnnouncement(announcementId: string) {
  const response = await fetch("/api/sections/announcements", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ announcementId })
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to remove announcement right now.");
  }
}

export async function sendGradeChangeEmailNotice(submissionId: string) {
  const response = await fetch("/api/sections/grade-change-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ submissionId })
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    warning?: string;
    error?: string;
  };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to send grade notification email.");
  }

  return payload;
}
