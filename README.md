# AI Gateway Edge

A full-stack **AI gateway** running as a single [Cloudflare Worker](https://developers.cloudflare.com/workers/):
a [React](https://react.dev/) + [Vite](https://vite.dev/) frontend and a
[Hono](https://hono.dev/) backend that proxies prompts to
[Google AI Studio](https://aistudio.google.com/) (Gemini).

The point of the project is the architecture: **the browser never touches the
provider credential.** The frontend only calls same-origin `/api/*` endpoints;
the Worker reads the key from its environment and makes the upstream call. So the
repo can be public while the key stays private.

## Features

- React SPA with three pages: **Home**, **Playground**, **Architecture**.
- Hono API: `/api/health`, `/api/models`, `/api/config/public`, `/api/chat`.
- Key stays backend-only — never in `VITE_*`, the bundle, logs, or responses.
- Abuse protection: model allowlist, payload size cap, 30s upstream timeout,
  best-effort per-IP rate limiting, sanitized logs, generic error messages.
- Standard response envelope: `{ success, data, error, requestId }`.

## Quick start

```bash
nvm use            # Node from .nvmrc
npm install
cp .dev.vars.example .dev.vars   # then put your real Google AI Studio key in it
npm run dev        # http://localhost:5173
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey) and set
`GOOGLE_AI_API_KEY` in `.dev.vars`. That file is gitignored — never commit it.

## Project structure

| Path                        | What                                                  |
| --------------------------- | ----------------------------------------------------- |
| `src/react-app/pages/`      | Home, Playground, Architecture.                       |
| `src/react-app/components/` | ChatForm, ResponsePanel, ModelSelector, etc.          |
| `src/react-app/lib/`        | API client + shared contract types.                   |
| `src/worker/index.ts`       | Hono app; mounts the API routes under `/api/`.        |
| `src/worker/routes/`        | One file per endpoint (health, models, config, chat). |
| `src/worker/services/`      | Google AI client, validators, rate limit, logger.     |
| `wrangler.json`             | Cloudflare Worker config (assets, compat).            |

In production the Worker serves the built SPA for non-API paths and handles
`/api/*` with Hono.

## Request flow

```
browser ──/api/chat──▶ Hono (Worker)  ──key──▶ Google AI Studio
   ▲                       │
   └──── normalized JSON ──┘   (credential never leaves the Worker)
```

## API contract

`POST /api/chat`

```json
{
	"model": "gemini-2.5-flash",
	"systemPrompt": "You are a DevOps assistant.",
	"message": "Explain a safe rollout.",
	"temperature": 0.4
}
```

```json
{
	"success": true,
	"data": { "text": "...", "model": "gemini-2.5-flash", "durationMs": 842 },
	"error": null,
	"requestId": "req_..."
}
```

## Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Dev server with HMR.                              |
| `npm test`           | Run Vitest once (`test:watch` for watch mode).    |
| `npm run lint`       | ESLint.                                           |
| `npm run check`      | Full validation: tsc + build + deploy dry-run.    |
| `npm run deploy`     | Deploy to Cloudflare Workers.                     |
| `npm run cf-typegen` | Regenerate the `Env` type after editing bindings. |

## Deploying

Set the provider key as a Worker **secret** (not a committed value):

```bash
npx wrangler secret put GOOGLE_AI_API_KEY
npm run deploy
```

For automatic deploys, `.github/workflows/deploy.yml` deploys `main` once you add
the repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The Google
key is configured separately on the Worker — never as a value exposed to the client.

## License

[MIT](./LICENSE)
