# Vite + React + Hono + Cloudflare Workers — Template

A starter template for full-stack apps on [Cloudflare Workers](https://developers.cloudflare.com/workers/):
a [React](https://react.dev/) + [Vite](https://vite.dev/) frontend and a
[Hono](https://hono.dev/) backend, deployed as a single Worker.

Includes TypeScript, ESLint + Prettier, Vitest tests, a pre-commit hook, and
GitHub Actions for CI and deploy.

## Use this template

Click **"Use this template"** on GitHub (or `gh repo create <name> --template <owner>/vite-react-template`),
then:

```bash
nvm use            # Node from .nvmrc
npm install
node scripts/rename.mjs my-app-name   # rename package + Worker
npm run dev        # http://localhost:5173
```

## Project structure

| Path                  | What                                             |
| --------------------- | ------------------------------------------------ |
| `src/react-app/`      | React frontend (Vite). Entry: `main.tsx`.        |
| `src/worker/index.ts` | Hono backend. API routes, mounted under `/api/`. |
| `wrangler.json`       | Cloudflare Worker config (bindings, assets).     |

In production the Worker serves the built SPA for non-API paths and handles
`/api/*` with Hono.

## Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Dev server with HMR.                              |
| `npm test`           | Run Vitest once (`test:watch` for watch mode).    |
| `npm run lint`       | ESLint.                                           |
| `npm run typecheck`  | TypeScript type-check.                            |
| `npm run format`     | Prettier write (`format:check` to verify).        |
| `npm run build`      | Type-check + production build.                    |
| `npm run deploy`     | Deploy to Cloudflare Workers.                     |
| `npm run cf-typegen` | Regenerate the `Env` type after editing bindings. |

## Deploying

`npm run deploy` deploys from your machine. For automatic deploys, the included
`.github/workflows/deploy.yml` deploys `main` once you add these repo secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Environment variables

Copy `.dev.vars.example` to `.dev.vars` for local secrets, and declare matching
bindings in `wrangler.json` (then run `npm run cf-typegen`).

## License

[MIT](./LICENSE)
