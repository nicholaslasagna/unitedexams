import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuestionCard } from "./question-card";

function renderReviewedQuestion(content: string, tags: string[]) {
  return renderToStaticMarkup(
    <QuestionCard
      question={{
        id: "render-check",
        type: "free",
        prompt: content,
        explanation: content,
        sampleAnswer: content,
        hintSteps: [content],
        walkthroughSteps: [content],
        tags
      }}
      questionNumber={1}
      totalQuestions={1}
      selected={[]}
      responseText="My answer"
      onToggleOption={() => {}}
      onResponseChange={() => {}}
      onSubmitQuestion={() => {}}
      submitted
      isCorrect
      onSelfMark={() => {}}
      showExplanation
      onToggleExplanation={() => {}}
      studyMode
    />
  );
}

describe("question Markdown rendering", () => {
  it.each(["mysql", "sql"])("keeps %s comparisons and identifiers as code in all six surfaces", (tag) => {
    const html = renderReviewedQuestion("Compare `homeGoals <=> awayGoals` and `user_id`.", [tag]);

    expect(html.match(/<code>homeGoals &lt;=&gt; awayGoals<\/code>/g)).toHaveLength(6);
    expect(html.match(/<code>user_id<\/code>/g)).toHaveLength(6);
    expect(html).not.toContain('class="katex');
  });

  it("still promotes inline mathematical expressions for other subjects", () => {
    const html = renderReviewedQuestion("Simplify `x^2 + y^2`.", ["algebra"]);

    expect(html).toContain('class="katex');
    expect(html).not.toContain("<code>x^2 + y^2</code>");
  });
});
