import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the grant surface of the SECURITY DEFINER RPCs.
 *
 * A SECURITY DEFINER function runs with its owner's privileges, so row
 * level security does not apply inside it. When such a function also takes
 * the account it acts on as a parameter instead of reading auth.uid(), the
 * EXECUTE grant is the only thing standing between a caller and acting as
 * somebody else.
 *
 * That is exactly how claim_professor_verification_code was reachable: it
 * marks any user id a verified professor, and it was granted to anon. Its
 * three siblings — grant_entitlement, recompute_entitlements,
 * audit_record_event — were all correctly revoked; it was missed. This test
 * is the check that would have caught it, and keeps catching it.
 */

const DIR = join(process.cwd(), "supabase/migrations");

/** Migrations replay in filename order, so later files win. */
const files = readdirSync(DIR)
  .filter((name) => name.endsWith(".sql"))
  .sort();

/** "a uuid, b text default null" -> "uuid,text" so defs and grants compare. */
function signature(args: string): string {
  return args
    .split(",")
    .map((arg) => arg.trim())
    .filter(Boolean)
    .map((arg) => {
      const withoutDefault = arg.split(/\s+default\s+/i)[0].trim();
      const parts = withoutDefault.split(/\s+/);
      return (parts.length > 1 ? parts.slice(1).join(" ") : parts[0]).toLowerCase();
    })
    .join(",");
}

interface FunctionDef {
  name: string;
  sig: string;
  file: string;
  definer: boolean;
  writes: boolean;
  checksCaller: boolean;
  takesAccountParam: string | null;
}

const definitions = new Map<string, FunctionDef>();
/** key -> roles currently holding EXECUTE, replayed grant by grant. */
const grants = new Map<string, Set<string>>();

for (const file of files) {
  const sql = readFileSync(join(DIR, file), "utf8");

  for (const match of sql.matchAll(
    /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-z0-9_]+)\s*\(([^)]*)\)([\s\S]*?)\$\$([\s\S]*?)\$\$/gi
  )) {
    const [, name, args, header, body] = match;
    const key = `${name}(${signature(args)})`;
    definitions.set(key, {
      name,
      sig: signature(args),
      file,
      definer: /security\s+definer/i.test(header),
      writes: /\b(insert\s+into|update\s+[a-z_.]+\s+set|delete\s+from)\b/i.test(body),
      checksCaller: body.includes("auth.uid()"),
      takesAccountParam:
        args.match(/\b([a-z_]*(?:user_id|professor_id|owner_id|actor_id)[a-z_]*)\s+uuid/i)?.[1] ??
        null
    });
  }

  for (const match of sql.matchAll(
    /(grant|revoke)\s+(?:all|execute)[\s\S]{0,40}?on\s+function\s+(?:public\.)?([a-z0-9_]+)\s*\(([^)]*)\)\s*(?:to|from)\s+([^;]+);/gi
  )) {
    const [, verb, name, args, roleList] = match;
    const key = `${name}(${signature(args)})`;
    const roles = roleList.split(",").map((role) => role.trim().toLowerCase());
    const current = grants.get(key) ?? new Set<string>();
    for (const role of roles) {
      if (verb.toLowerCase() === "grant") current.add(role);
      else current.delete(role);
    }
    grants.set(key, current);
  }
}

const PUBLIC_ROLES = ["anon", "authenticated", "public"];

describe("SECURITY DEFINER grant surface", () => {
  it("parses the migrations it is meant to be checking", () => {
    // A regex that silently stops matching would make every assertion below
    // vacuously pass, which is the failure mode that matters here.
    expect(files.length).toBeGreaterThan(20);
    expect(definitions.size).toBeGreaterThan(50);
    expect(grants.size).toBeGreaterThan(20);
    expect([...definitions.values()].filter((d) => d.definer).length).toBeGreaterThan(20);
  });

  it("never exposes a definer function that writes as a caller-named account", () => {
    const exposed: string[] = [];
    for (const [key, def] of definitions) {
      if (!def.definer || !def.writes) continue;
      if (!def.takesAccountParam || def.checksCaller) continue;
      const roles = grants.get(key);
      if (!roles) continue; // never granted at all
      const open = PUBLIC_ROLES.filter((role) => roles.has(role));
      if (open.length > 0) {
        exposed.push(
          `${key} takes ${def.takesAccountParam} from the caller, writes, never reads ` +
            `auth.uid(), and is granted to ${open.join(", ")} (${def.file})`
        );
      }
    }
    expect(exposed).toEqual([]);
  });

  it("keeps the specific function this test was written for locked down", () => {
    const key = "claim_professor_verification_code(uuid,text,text,uuid)";
    expect(definitions.has(key), "signature changed — update this test").toBe(true);
    const roles = grants.get(key) ?? new Set<string>();
    expect([...roles].sort()).toEqual([]);
  });
});
