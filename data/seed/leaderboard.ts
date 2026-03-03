import type { LeaderboardEntry } from "@/lib/types";

export const seededLeaderboard: LeaderboardEntry[] = [
  { id: "p1", name: "Mia K.", school: "Northlake College", streak: 21, points: 1280, role: "student" },
  { id: "p2", name: "Jordan L.", school: "River State", streak: 18, points: 1155, role: "student" },
  { id: "p3", name: "TA Arjun", school: "Northlake College", streak: 15, points: 1088, role: "ta" },
  { id: "p4", name: "Noah T.", school: "Summit Tech", streak: 12, points: 1032, role: "student" },
  { id: "p5", name: "Prof. Chen", school: "Summit Tech", streak: 9, points: 980, role: "professor" }
];

export const testimonials = [
  {
    quote:
      "United Exams made my review sessions actually enjoyable. The walkthrough mode feels like having a tutor in my browser.",
    name: "Ariella M.",
    role: "Differential Equations Student"
  },
  {
    quote:
      "Our TA team uses curated quiz sets before office hours. Students show up with much better questions now.",
    name: "Ruben P.",
    role: "Teaching Assistant"
  },
  {
    quote:
      "The design is beautiful, but the best part is clarity. Progress by topic gives students immediate direction.",
    name: "Dr. Elaine Foster",
    role: "Professor, Software Engineering"
  }
];
