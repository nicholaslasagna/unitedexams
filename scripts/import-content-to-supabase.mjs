#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const contentDir = process.argv[2] ?? path.resolve(process.cwd(), "content");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set both before running this importer."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function collectJsonFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(fullPath, out);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      out.push(fullPath);
    }
  }
  return out;
}

function readDoc(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed?.set || !Array.isArray(parsed?.questions)) {
    throw new Error(`Invalid content format: ${filePath}`);
  }
  return parsed;
}

function normalizeQuestion(setId, item, index) {
  const externalId = item.externalId ?? item.external_id ?? item.id ?? `${setId}-q${index + 1}`;
  const stableExternalId = String(externalId);
  const questionId = String(item.id ?? `${setId}-${stableExternalId}`);
  const type = item.type === "multi" ? "multi" : item.type === "single" ? "single" : "free";

  return {
    id: questionId,
    external_id: stableExternalId,
    quiz_set_id: setId,
    type,
    prompt_md: String(item.prompt ?? item.prompt_md ?? ""),
    options: Array.isArray(item.options) ? item.options : null,
    correct: Array.isArray(item.correct) ? item.correct : null,
    explanation_md: String(item.explanation ?? item.explanation_md ?? ""),
    solution_md: item.solutionMd ?? item.solution_md ?? null,
    from_professor: Boolean(item.fromProfessor ?? item.from_professor),
    walkthrough_steps: Array.isArray(item.walkthroughSteps)
      ? item.walkthroughSteps
      : Array.isArray(item.walkthrough_steps)
        ? item.walkthrough_steps
        : null,
    references_data: Array.isArray(item.references) ? item.references : null,
    difficulty: item.difficulty ?? null,
    homework_format: item.homeworkFormat ?? item.homework_format ?? null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    created_at: new Date().toISOString()
  };
}

async function importFile(filePath) {
  const doc = readDoc(filePath);
  const set = doc.set;
  const setId = String(set.id);

  const quizSetRow = {
    id: setId,
    course_id: String(set.courseId ?? set.course_id),
    title: String(set.title),
    description: String(set.description ?? ""),
    difficulty:
      set.difficulty === "Beginner"
        ? "intro"
        : set.difficulty === "Intermediate"
          ? "medium"
          : set.difficulty === "Advanced"
            ? "hard"
            : String(set.difficulty ?? "medium"),
    est_minutes: Number(set.estMinutes ?? set.est_minutes ?? 20),
    tags: Array.isArray(set.tags) ? set.tags : [],
    is_published: set.isPublished ?? set.is_published ?? true,
    mode: set.mode ?? "quiz",
    question_count_target: set.questionCountTarget ?? set.question_count_target ?? null,
    is_exam_simulation:
      set.isExamSimulation ?? set.is_exam_simulation ?? (set.mode === "exam")
  };

  const { error: quizSetError } = await supabase.from("quiz_sets").upsert(quizSetRow, {
    onConflict: "id"
  });
  if (quizSetError) {
    throw new Error(`Failed upserting quiz_set ${setId}: ${quizSetError.message}`);
  }

  const questionRows = doc.questions.map((question, index) => normalizeQuestion(setId, question, index));
  const incomingExternalIds = questionRows.map((row) => row.external_id);

  const { data: existingRows, error: existingError } = await supabase
    .from("questions")
    .select("id, external_id")
    .eq("quiz_set_id", setId);

  if (existingError) {
    throw new Error(`Failed reading existing questions for ${setId}: ${existingError.message}`);
  }

  const staleIds = (existingRows ?? [])
    .filter((row) => row.external_id && !incomingExternalIds.includes(row.external_id))
    .map((row) => row.id);

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase.from("questions").delete().in("id", staleIds);
    if (deleteError) {
      throw new Error(`Failed deleting stale questions for ${setId}: ${deleteError.message}`);
    }
  }

  const chunkSize = 100;
  for (let idx = 0; idx < questionRows.length; idx += chunkSize) {
    const chunk = questionRows.slice(idx, idx + chunkSize);
    const { error: questionError } = await supabase.from("questions").upsert(chunk, {
      onConflict: "external_id"
    });
    if (questionError) {
      throw new Error(`Failed upserting questions for ${setId}: ${questionError.message}`);
    }
  }

  console.log(`Imported ${questionRows.length} questions for ${setId}`);
}

async function main() {
  const files = collectJsonFiles(contentDir).sort();
  if (files.length === 0) {
    console.log(`No JSON files found under ${contentDir}`);
    return;
  }

  for (const filePath of files) {
    await importFile(filePath);
  }

  console.log(`Done. Imported ${files.length} content file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
