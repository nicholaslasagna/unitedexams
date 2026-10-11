import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PublicExamOneRoute, { generateMetadata } from "@/app/courses/[courseId]/exam-1/page";
import AppExamOneRoute from "@/app/app/courses/[courseId]/exam-1/page";
import { algorithmsExam1PrioritySet, algorithmsExam1QuizSets } from "@/data/seed/alg-exam1";
import { ExamOnePage } from "@/features/db-exam1/exam-1-page";
import { AlgorithmsExamPrepPage } from "./exam-prep-page";

const paramsFor = (courseId: string) => ({ params: Promise.resolve({ courseId }) });
const routes = [
  { name: "public", route: PublicExamOneRoute, prefix: "" },
  { name: "app", route: AppExamOneRoute, prefix: "/app" }
];

// Inspect route output without rendering either course's unrelated client shell.
function findPage(
  node: ReactNode,
  page: typeof AlgorithmsExamPrepPage | typeof ExamOnePage
): ReactElement<{ routePrefix?: string }> | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ children?: ReactNode; routePrefix?: string }>(child)) continue;
    if (child.type === page) return child;
    const found = findPage(child.props.children, page);
    if (found) return found;
  }
  return undefined;
}

describe("Algorithms exam prep landing", () => {
  it.each(routes)("links $name practice to study mode and the mock to strict exam mode", ({ prefix }) => {
    const html = renderToStaticMarkup(<AlgorithmsExamPrepPage routePrefix={prefix} />);
    const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);
    const mock = algorithmsExam1QuizSets.find((set) => set.id === "alg-exam1-written-mock")!;
    const studySets = algorithmsExam1QuizSets.filter((set) => set.id !== mock.id);

    for (const set of studySets) {
      expect(hrefs, set.id).toContain(`${prefix}/quiz/${set.id}?mode=study`);
      expect(hrefs, set.id).not.toContain(`${prefix}/quiz/${set.id}?mode=exam`);
    }
    expect(hrefs).toContain(`${prefix}/quiz/${mock.id}?mode=exam`);
    expect(hrefs).not.toContain(`${prefix}/quiz/${mock.id}?mode=study`);
    expect(hrefs).toContain(`${prefix}/courses/analysis-of-algorithms`);
  });

  it("shows the priority and complete-bank counts from their actual metadata", () => {
    const html = renderToStaticMarkup(<AlgorithmsExamPrepPage routePrefix="" />);
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const complete = algorithmsExam1QuizSets.find((set) => set.id === "alg-exam1-complete-review")!;

    expect(text).toContain(`Start ${algorithmsExam1PrioritySet.questions.length} priority problems`);
    expect(text).toContain(`Open all ${complete.questions.length} problems`);
  });

  it("labels the mock timer and format as practice assumptions", () => {
    const html = renderToStaticMarkup(<AlgorithmsExamPrepPage routePrefix="" />);
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

    expect(text).toMatch(/75-minute timer and mock format are practice settings/);
    expect(text).toMatch(/actual exam duration, format and exact coverage have not been confirmed/);
    expect(text).toMatch(/stated study targets/);
    expect(text).toMatch(/LCS is related lecture practice, rather than confirmed projected review/);
    expect(text).toMatch(/does not establish every question projected in class or guarantee the exam questions/);
  });
});

describe("shared Exam 1 routes", () => {
  it("retains Database Exam 1 metadata and gives Algorithms its own canonical", async () => {
    expect(await generateMetadata(paramsFor("database-systems"))).toEqual({
      title: "Exam 1 Mastery | Concepts of Database Systems",
      description:
        "Relational model, relational algebra, joins, semijoins and division — practice built from the course's own lectures and homework.",
      alternates: { canonical: "/courses/database-systems/exam-1" }
    });
    const algorithms = await generateMetadata(paramsFor("analysis-of-algorithms"));
    expect(algorithms.title).toBe("Exam 1 Preparation | Analysis of Algorithms");
    expect(algorithms.alternates?.canonical).toBe("/courses/analysis-of-algorithms/exam-1");
  });

  it.each(routes)("dispatches both supported courses on the $name route", async ({ route, prefix }) => {
    const algorithms = await route(paramsFor("analysis-of-algorithms"));
    expect(findPage(algorithms, AlgorithmsExamPrepPage)?.props.routePrefix).toBe(prefix);
    expect(findPage(algorithms, ExamOnePage)).toBeUndefined();

    const database = await route(paramsFor("database-systems"));
    expect(findPage(database, ExamOnePage)?.props.routePrefix).toBe(prefix);
    expect(findPage(database, AlgorithmsExamPrepPage)).toBeUndefined();
  });

  it.each(routes)("rejects unsupported courses on the $name route", async ({ route }) => {
    await expect(route(paramsFor("operating-systems"))).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
