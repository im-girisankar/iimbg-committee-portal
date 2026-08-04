import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

/**
 * Minimal, explicit test config, merged on top of the real `vite.config.ts`
 * so the `@ -> /src` alias (used pervasively under `components/app` and
 * `components/ui`) and the React plugin resolve identically for tests and
 * for the dev server — one source of truth, no drift.
 *
 * Default environment stays "node", matching what the existing 59 tests
 * already ran under with no config file at all, so `tests/api.test.ts`,
 * `tests/events.test.ts`, `tests/schemas.test.ts` and `tests/format.test.ts`
 * are unaffected. `tests/events-page.test.tsx` needs a DOM, so it opts into
 * jsdom itself via a per-file `// @vitest-environment jsdom` docblock
 * rather than flipping the environment globally.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
    },
  }),
);
