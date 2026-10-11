import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, Clock3, FileText, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { algorithmsExam1PrioritySet, algorithmsExam1QuizSets } from "@/data/seed/alg-exam1";
import { modeLabel, resolveQuizSetMode } from "@/lib/study/set-mode";
import type { QuizSet } from "@/lib/types";

function setHref(set: QuizSet, routePrefix: string) {
  const mode = resolveQuizSetMode(set);
  return mode === "homework"
    ? `${routePrefix}/homework/${set.id}`
    : `${routePrefix}/quiz/${set.id}?mode=${mode === "exam" ? "exam" : "study"}`;
}

export function AlgorithmsExamPrepPage({ routePrefix }: { routePrefix: string }) {
  const priority = algorithmsExam1PrioritySet;
  const review = algorithmsExam1QuizSets.find((set) => set.id === "alg-exam1-complete-review");
  const practiceSets = algorithmsExam1QuizSets.filter(
    (set) => resolveQuizSetMode(set) !== "exam" && set.id !== priority.id && set.id !== review?.id
  );
  const mocks = algorithmsExam1QuizSets.filter((set) => resolveQuizSetMode(set) === "exam");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <Link
          href={`${routePrefix}/courses/analysis-of-algorithms`}
          className="inline-flex items-center gap-1.5 text-body-sm text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Analysis of Algorithms
        </Link>
        <Badge tone="accent">Exam 1 preparation</Badge>
        <h1 className="font-display text-display-md text-text">Algorithms Exam 1 preparation</h1>
        <p className="max-w-3xl text-body-sm leading-relaxed text-muted">
          Follow the professor&apos;s study advice: homework and the questions projected in
          class. Start with Homework 1 and 2 and the photographed edit-distance review.
          The syllabus lists the first exam on October 16; the exact exam coverage and full
          set of projected questions have not been supplied.
        </p>
      </header>

      <section aria-labelledby="algorithms-priority">
        <Card className="border-accent/35 bg-accent/5">
          <CardBody className="space-y-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
              <Flag className="h-4 w-4" aria-hidden />
              Professor&apos;s stated study targets · No timer
            </p>
            <h2 id="algorithms-priority" className="font-display text-xl font-semibold text-text">
              {priority.title}
            </h2>
            <p className="text-body-sm leading-relaxed text-muted">{priority.description}</p>
            <p className="text-body-sm leading-relaxed text-text-secondary">
              Work through the supplied photo&apos;s edit-distance problem with X = <code>esteban</code>
              {" "}and Y = <code>stephen</code>. For written problems, show the intermediate steps
              and reasoning before checking the model answer.
            </p>
            <p className="text-xs leading-relaxed text-muted">
              The photo documents one projected review example. It does not establish every
              question projected in class or guarantee the exam questions.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={setHref(priority, routePrefix)}>
                Start {priority.questions.length} priority problems <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </CardBody>
        </Card>
      </section>

      <section aria-labelledby="algorithms-practice" className="space-y-4">
        <div className="space-y-1">
          <h2 id="algorithms-practice" className="font-display text-xl font-semibold text-text">
            Related lecture practice and broader review
          </h2>
          <p className="text-body-sm text-muted">
            Use these sets as backup after the professor&apos;s stated study targets. LCS is
            related lecture practice, rather than confirmed projected review. Problems include
            source references, hints and worked answers; written questions use a rubric for self-marking.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {practiceSets.map((set) => (
            <Card key={set.id}>
              <CardBody className="flex h-full flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{modeLabel(resolveQuizSetMode(set))}</Badge>
                  <span className="text-xs text-muted">{set.questions.length} problems · No timer</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-text">{set.title}</h3>
                <p className="flex-1 text-body-sm leading-relaxed text-muted">{set.description}</p>
                <Button asChild variant="secondary" className="w-full sm:w-auto sm:self-start">
                  <Link href={setHref(set, routePrefix)}>
                    Practice <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {review ? (
          <Card>
            <CardBody className="space-y-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
                <BookOpenText className="h-4 w-4" aria-hidden />
                Full practice bank · No timer
              </p>
              <h3 className="font-display text-lg font-semibold text-text">{review.title}</h3>
              <p className="text-body-sm leading-relaxed text-muted">{review.description}</p>
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={setHref(review, routePrefix)}>
                  Open all {review.questions.length} problems <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardBody>
          </Card>
        ) : null}
      </section>

      <section aria-labelledby="algorithms-mock" className="space-y-4">
        <div className="space-y-2">
          <h2 id="algorithms-mock" className="font-display text-xl font-semibold text-text">
            Try a written mock
          </h2>
          <p className="text-body-sm leading-relaxed text-muted">
            Practise six multipart questions for 100 marks. Answers stay hidden until you
            finish the sitting, then you self-mark against the worked solutions and rubric.
          </p>
          <p className="rounded-xl border border-borderc bg-soft p-3 text-xs leading-relaxed text-muted">
            The 75-minute timer and mock format are practice settings. The actual exam duration,
            format and exact coverage have not been confirmed by the supplied material.
          </p>
        </div>
        {mocks.map((set) => (
          <Card key={set.id}>
            <CardBody className="space-y-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
                <FileText className="h-4 w-4" aria-hidden />
                Written mock
              </p>
              <h3 className="font-display text-lg font-semibold text-text">{set.title}</h3>
              <p className="text-body-sm leading-relaxed text-muted">{set.description}</p>
              <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                {set.timerDefaultMinutes} minutes · {set.questions.length} questions ·{" "}
                {set.questions.reduce((marks, question) => marks + (question.points ?? 1), 0)} marks
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href={setHref(set, routePrefix)}>
                  Open written mock <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardBody>
          </Card>
        ))}
      </section>
    </div>
  );
}
