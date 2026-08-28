import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Vitest previously ran with no config at all, so the `@/…` path alias that
 * the rest of the codebase imports by never resolved. Tests could only
 * import modules that happened to use relative paths, which ruled out most
 * of `features/` and `lib/`. Mirroring the alias from tsconfig makes the
 * whole app testable.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**", ".open-next/**"]
  }
});
