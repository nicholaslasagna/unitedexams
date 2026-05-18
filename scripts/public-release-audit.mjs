#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean);

const failures = [];

const forbiddenPathPatterns = [
  /^\.env(?:\.|$)/,
  /^supabase\/\.temp(?:\/|$)/,
  /^\.claude(?:\/|$)/,
  /^public\/fonts\/.*\.(?:otf|ttf|woff2?)$/i,
  /(?:^|\/).*\.(?:pem|p12|pfx|key)$/i,
  /(?:^|\/).*credential.*$/i,
  /(?:^|\/).*secret.*$/i
];

const allowedPathExceptions = new Set([".env.example"]);

for (const file of trackedFiles) {
  if (allowedPathExceptions.has(file)) continue;
  if (forbiddenPathPatterns.some((pattern) => pattern.test(file))) {
    failures.push(`Forbidden tracked path: ${file}`);
  }
}

const secretPatterns = [
  ["Stripe secret key", /sk_(?:live|test)_[A-Za-z0-9_]{16,}/],
  ["Stripe restricted key", /rk_live_[A-Za-z0-9_]{16,}/],
  ["Stripe webhook secret", /whsec_[A-Za-z0-9_]{16,}/],
  ["GitHub token", /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}/],
  ["GitHub fine-grained token", /github_pat_[A-Za-z0-9_]{20,}/],
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["Google API key", /AIza[0-9A-Za-z_-]{20,}/],
  ["Slack token", /xox[baprs]-[0-9A-Za-z-]{20,}/],
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_]{16,}/],
  ["Private key block", /-----BEGIN (?:RSA |EC |OPENSSH |PRIVATE )?KEY-----/],
  ["United Exams Supabase project ref", new RegExp("kkqrwmmt" + "ptckfnglzzyy")]
];

const textFileExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".sql",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
  ".toml",
  ".cjs",
  ".mts"
]);

function isTextFile(file) {
  if (file === ".gitignore" || file === ".env.example") return true;
  const match = file.match(/(\.[^.\/]+)$/);
  return match ? textFileExtensions.has(match[1].toLowerCase()) : false;
}

for (const file of trackedFiles) {
  if (!isTextFile(file)) continue;
  const contents = readFileSync(file, "utf8");
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(contents)) {
      failures.push(`${label} pattern found in ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Public release audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Public release audit passed.");
