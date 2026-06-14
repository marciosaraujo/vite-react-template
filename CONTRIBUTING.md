# Contributing

Thanks for contributing! This project runs on Cloudflare Workers with a React
(Vite) frontend and a Hono backend.

## Setup

```bash
nvm use        # Node version from .nvmrc
npm install
npm run dev     # http://localhost:5173
```

## Project layout

- `src/react-app/` — React frontend (Vite).
- `src/worker/index.ts` — Hono backend. API routes go here, mounted under `/api/`.

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm test
```

A pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files)
automatically. CI runs the full suite on every PR.

## Tests

- React: `src/react-app/**/*.test.tsx` (jsdom + Testing Library).
- Worker: `src/worker/**/*.test.ts` (node; test routes with `app.request(...)`).

Place tests next to the file they cover. Run a single file with
`npx vitest run path/to/file.test.ts`.

## Deploying

`npm run deploy` deploys to Cloudflare Workers. CI also deploys `main`
automatically when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets
are configured.
