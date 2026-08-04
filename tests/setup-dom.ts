/**
 * Shared setup for the jsdom component tests.
 *
 * Imported explicitly by each `*.test.tsx` rather than wired into
 * `vitest.config.ts` as a global `setupFiles`, because the other four suites
 * run in the `node` environment where `cleanup()` has no DOM to work on.
 *
 * Without the `afterEach(cleanup)` below, React Testing Library leaves each
 * render mounted, so the next test in the same file queries a document
 * containing every previous render too — which shows up as duplicated
 * elements (e.g. six `/register` anchors for three cards) and looks
 * convincingly like a component bug.
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
