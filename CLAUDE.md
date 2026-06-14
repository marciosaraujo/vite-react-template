# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Full-stack app on Cloudflare Workers. Two halves share one build:

- `src/react-app/` — React 19 frontend (Vite). Entry: `main.tsx`.
- `src/worker/index.ts` — Hono backend. All API routes live here; mount them under `/api/`.

In production the Worker serves the built SPA (`dist/client`) for non-API paths via `not_found_handling: "single-page-application"` (see `wrangler.json`). Frontend calls the backend with same-origin `/api/...` fetches.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173 (proxies API to the Worker).
- `npm run check` — full validation: `tsc && vite build && wrangler deploy --dry-run`. Run this before deploying, not just `tsc`.
- `npm run deploy` — build + `wrangler deploy` to Cloudflare.
- `npm run lint` / `npm run typecheck` / `npm run format` — ESLint, `tsc -b`, Prettier.
- `npx wrangler tail` — stream live logs from the deployed Worker.

A husky pre-commit hook runs lint-staged (ESLint + Prettier on staged files). CI (`.github/workflows/ci.yml`) runs lint + typecheck + test + build on every PR; `deploy.yml` deploys `main` when Cloudflare secrets are set.

## Worker bindings & types

`Env` (the Worker bindings type) is generated, not hand-written. After editing bindings in `wrangler.json`, run `npm run cf-typegen` to regenerate `worker-configuration.d.ts`. Do not edit that file by hand.

## Conventions

- Indentation is **tabs** across source and config files.
- Separate tsconfigs per environment: `tsconfig.app.json` (React), `tsconfig.worker.json` (Worker), `tsconfig.node.json` (build tooling).

## Testing

Vitest. `npm test` runs once; `npm run test:watch` for watch mode. Config splits tests into two projects by location (`vitest.config.ts`):

- `src/react-app/**/*.test.tsx` — run in **jsdom** with Testing Library; `vitest.setup.ts` loads jest-dom matchers.
- `src/worker/**/*.test.ts` — run in **node**; test Hono routes with `app.request("/path")` (no server needed).

Place a test next to the file it covers (`Foo.tsx` → `Foo.test.tsx`).
