export interface ProfileRecord {
  id: string;
  email: string | null;
  display_name: string;
  real_name: string | null;
  show_real_name: boolean;
  university_id: string | null;
  show_university: boolean;
  role: "student" | "professor" | "admin";
  reset_required: boolean;
}

export interface UserPreferenceRecord {
  user_id: string;
  theme_mode: "dark" | "light" | "system";
  accent_hue: number;
  accent_strength: number;
  reduce_motion: boolean;
  dashboard_layout: string;
}

export interface UniversityRecord {
  id: string;
  name: string;
  country?: string | null;
  state?: string | null;
}

export interface UserCourseRecord {
  user_id: string;
  course_id: string;
}

export interface LeaderboardRpcRow {
  rank: number;
  user_id: string;
  display_name: string;
  real_name: string | null;
  university_name: string | null;
  points: number;
  streak: number;
  is_current_user: boolean;
}

export interface RecommendationRpcRow {
  quiz_set_id: string;
  title: string;
  course_id: string;
  description: string;
  difficulty: string;
  est_minutes: number;
  tags: string[];
  reason: string;
  recommendation_score: number;
}
