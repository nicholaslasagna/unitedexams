import { HomeworkIndexContent } from "@/features/study/homework-index-page";

export default function AppHomeworkIndexRedirect() {
  return (
    <HomeworkIndexContent
      routePrefix="/app"
      title="Homework Mode"
      subtitle="Work assignments one question at a time with hints, walkthroughs, and mastery-first feedback."
    />
  );
}
