import { courses } from "@/data/seed/courses";
import { notesByCourse } from "@/data/seed/notes";
import { quizSets } from "@/data/seed/quiz-sets";

export { courses, notesByCourse, quizSets };

export function getCourse(courseId: string) {
  return courses.find((course) => course.id === courseId);
}

export function getQuizSet(quizId: string) {
  return quizSets.find((quiz) => quiz.id === quizId);
}

export function getCourseQuizSets(courseId: string) {
  return quizSets.filter((quiz) => quiz.courseId === courseId);
}

export function getCourseContent(courseId: string) {
  return notesByCourse[courseId];
}
