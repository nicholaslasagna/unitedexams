import { describe, expect, it } from "vitest";
import { displayTags } from "@/lib/study/display-tags";

describe("displayTags", () => {
  it("drops format tags the mode badge already states", () => {
    expect(
      displayTags(
        ["homework-1", "step-by-step", "free-response", "solve-only"],
        "Differential Equations Homework 1 Study"
      )
    ).toEqual([]);
  });

  it("keeps real topics", () => {
    expect(
      displayTags(["ivp", "second-order", "free-response"], "Homework 3 Study")
    ).toEqual(["ivp", "second-order"]);
  });

  it("drops a tag whose every word is already in the title", () => {
    expect(displayTags(["chapter-5", "pipeline"], "Chapter 5 Review")).toEqual(["pipeline"]);
  });

  it("keeps a partially-overlapping tag, which still adds information", () => {
    expect(displayTags(["chapter-5-hazards"], "Chapter 5 Review")).toEqual([
      "chapter-5-hazards"
    ]);
  });

  it("caps the list", () => {
    expect(displayTags(["a", "b", "c", "d", "e"], "Title")).toHaveLength(3);
    expect(displayTags(["a", "b", "c", "d"], "Title", 2)).toHaveLength(2);
  });

  it("is case and separator insensitive", () => {
    expect(displayTags(["Free-Response", "RISC_V"], "Title")).toEqual(["RISC_V"]);
  });
});
