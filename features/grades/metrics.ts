export interface SectionGradePolicy {
  assignmentWeight: number;
  examWeight: number;
}

export interface CoursePolicySummary {
  policyLabel: string;
  hasMixedPolicies: boolean;
}

export interface GradeAggregationItem {
  sectionId: string;
  kind: "assignment" | "exam";
  score: number | null;
}

export const DEFAULT_SECTION_GRADE_POLICY: SectionGradePolicy = {
  assignmentWeight: 40,
  examWeight: 60
};

function clampWeight(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function normalizeSectionGradePolicy(
  policy?: Partial<SectionGradePolicy> | null
): SectionGradePolicy {
  const assignmentWeight = clampWeight(policy?.assignmentWeight ?? DEFAULT_SECTION_GRADE_POLICY.assignmentWeight);
  const examWeight = clampWeight(policy?.examWeight ?? DEFAULT_SECTION_GRADE_POLICY.examWeight);
  const total = assignmentWeight + examWeight;

  if (total <= 0) {
    return { ...DEFAULT_SECTION_GRADE_POLICY };
  }

  if (total === 100) {
    return { assignmentWeight, examWeight };
  }

  const normalizedAssignment = Math.round((assignmentWeight / total) * 100);
  return {
    assignmentWeight: normalizedAssignment,
    examWeight: 100 - normalizedAssignment
  };
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function computeSectionWeightedAverage(
  items: Array<Pick<GradeAggregationItem, "kind" | "score">>,
  policy?: Partial<SectionGradePolicy> | null
) {
  const gradedAssignments = items
    .filter((item) => item.kind === "assignment" && typeof item.score === "number")
    .map((item) => Number(item.score));
  const gradedExams = items
    .filter((item) => item.kind === "exam" && typeof item.score === "number")
    .map((item) => Number(item.score));

  const assignmentAverage = average(gradedAssignments);
  const examAverage = average(gradedExams);
  const normalizedPolicy = normalizeSectionGradePolicy(policy);

  const weightedParts: Array<{ average: number; weight: number }> = [];
  if (assignmentAverage !== null) {
    weightedParts.push({ average: assignmentAverage, weight: normalizedPolicy.assignmentWeight });
  }
  if (examAverage !== null) {
    weightedParts.push({ average: examAverage, weight: normalizedPolicy.examWeight });
  }

  if (weightedParts.length === 0) return null;

  const totalWeight = weightedParts.reduce((sum, part) => sum + part.weight, 0);
  const divisor = totalWeight > 0 ? totalWeight : weightedParts.length;
  const weightedAverage =
    weightedParts.reduce((sum, part) => sum + part.average * (part.weight > 0 ? part.weight : 1), 0) / divisor;

  return roundOneDecimal(weightedAverage);
}

export function computeCourseWeightedAverage(
  items: GradeAggregationItem[],
  policyBySectionId: Record<string, Partial<SectionGradePolicy> | null | undefined>
) {
  const gradedItems = items.filter((item) => typeof item.score === "number");
  if (gradedItems.length === 0) return null;

  const itemsBySection = new Map<string, GradeAggregationItem[]>();
  for (const item of gradedItems) {
    itemsBySection.set(item.sectionId, [...(itemsBySection.get(item.sectionId) ?? []), item]);
  }

  const sectionAverages: Array<{ average: number; gradedCount: number }> = [];
  for (const [sectionId, sectionItems] of itemsBySection.entries()) {
    const sectionAverage = computeSectionWeightedAverage(sectionItems, policyBySectionId[sectionId]);
    if (sectionAverage === null) continue;
    sectionAverages.push({
      average: sectionAverage,
      gradedCount: sectionItems.length
    });
  }

  if (sectionAverages.length === 0) return null;

  const totalGradedCount = sectionAverages.reduce((sum, section) => sum + section.gradedCount, 0);
  const weightedAverage =
    sectionAverages.reduce((sum, section) => sum + section.average * section.gradedCount, 0) / totalGradedCount;

  return roundOneDecimal(weightedAverage);
}

export function summarizeCoursePolicies(
  policies: Array<Partial<SectionGradePolicy> | null | undefined>
): CoursePolicySummary {
  const normalizedPolicies = policies.map((policy) => normalizeSectionGradePolicy(policy));
  if (normalizedPolicies.length === 0) {
    const fallback = normalizeSectionGradePolicy();
    return {
      policyLabel: `Assignments ${fallback.assignmentWeight}% · Exams ${fallback.examWeight}%`,
      hasMixedPolicies: false
    };
  }

  const first = normalizedPolicies[0];
  const hasMixedPolicies = normalizedPolicies.some(
    (policy) =>
      policy.assignmentWeight !== first.assignmentWeight || policy.examWeight !== first.examWeight
  );

  if (hasMixedPolicies) {
    return {
      policyLabel: "Section-weighted grading",
      hasMixedPolicies: true
    };
  }

  return {
    policyLabel: `Assignments ${first.assignmentWeight}% · Exams ${first.examWeight}%`,
    hasMixedPolicies: false
  };
}

export function computeOverallAverageFromCourseSummaries(
  courses: Array<{ average: number | null; gradedCount: number }>
) {
  const gradedCourses = courses.filter(
    (course) => typeof course.average === "number" && course.gradedCount > 0
  ) as Array<{ average: number; gradedCount: number }>;

  if (gradedCourses.length === 0) return null;

  const totalWeight = gradedCourses.reduce((sum, course) => sum + course.gradedCount, 0);
  const weightedAverage =
    gradedCourses.reduce((sum, course) => sum + course.average * course.gradedCount, 0) / totalWeight;

  return roundOneDecimal(weightedAverage);
}
