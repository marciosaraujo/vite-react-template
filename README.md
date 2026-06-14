# AI Gateway Edge

A full-stack **AI gateway** running as a single [Cloudflare Worker](https://developers.cloudflare.com/workers/):
a [React](https://react.dev/) + [Vite](https://vite.dev/) frontend and a
[Hono](https://hono.dev/) backend that proxies prompts to
[Google AI Studio](https://aistudio.google.com/) (Gemini).

The point of the project is the architecture: **the browser never touches the
provider credential.** The frontend only calls same-origin `/api/*` endpoints;
the Worker reads the key from its environment and makes the upstream call. So the
repo can be public while the key stays private — a clean pattern for putting AI
behind your own internal API, the kind of "model gateway" a DevOps/SRE team would
actually run.

**Live demo:** https://ai-gateway-edge.marciosaraujo.workers.dev/

## Features

- React SPA with three pages: **Home**, **Playground**, **Architecture** —
  client-side routing that survives direct loads and refresh.
- Hono API: `/api/health`, `/api/models`, `/api/config/public`, `/api/chat`.
- Curated model allowlist (Gemini 3.x + 2.5) — easy to extend, hard to abuse.
- Key stays backend-only — never in `VITE_*`, the bundle, logs, or responses.
- Abuse protection: model allowlist, payload size cap, 30s upstream timeout,
  best-effort per-IP rate limiting, sanitized logs, generic error messages.
- Standard response envelope: `{ success, data, error, requestId }`.

## Why this stack

| Tech                      | What it brings                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **React + Vite**          | Reactive UI, instant HMR in dev, small optimized production bundle.                         |
| **Hono**                  | Tiny, fast, Express-style web framework that runs natively on the Workers edge runtime.     |
| **Cloudflare Workers**    | Serverless at the edge: low global latency, autoscaling, no servers, deploys in seconds.    |
| **TypeScript end-to-end** | The response contract is typed on both sides, so integration mistakes fail at compile time. |

One repository, one build, one deploy command. Frontend and backend share the
same origin (no CORS), with no separate infrastructure to maintain.

## Quick start

```bash
nvm use            # Node from .nvmrc
npm install
cp .dev.vars.example .dev.vars   # then put your real Google AI Studio key in it
npm run dev        # http://localhost:5173
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey) and set
`GOOGLE_AI_API_KEY` in `.dev.vars`. That file is gitignored — never commit it.

## Models

The allowlist lives in `src/worker/lib/models.ts` (default: `gemini-2.5-flash`):

| Model                    | Notes                                |
| ------------------------ | ------------------------------------ |
| `gemini-3.5-flash`       | Newest fast, general-purpose model.  |
| `gemini-3.1-pro-preview` | Most capable. Preview — may change.  |
| `gemini-3.1-flash-lite`  | Newest lightweight, low-cost model.  |
| `gemini-2.5-pro`         | Stable high-capability model.        |
| `gemini-2.5-flash`       | Stable, fast, low-cost. **Default.** |
| `gemini-2.5-flash-lite`  | Stable lightest/cheapest model.      |

To see what your account actually has access to:

```bash
curl -s https://generativelanguage.googleapis.com/v1beta/models \
  -H "x-goog-api-key: $GOOGLE_AI_API_KEY"
```

## Project structure

| Path                        | What                                                       |
| --------------------------- | ---------------------------------------------------------- |
| `src/react-app/pages/`      | Home, Playground, Architecture.                            |
| `src/react-app/components/` | ChatForm, ResponsePanel, ModelSelector, etc.               |
| `src/react-app/lib/`        | API client + shared contract types.                        |
| `src/worker/index.ts`       | Hono app; mounts API routes, delegates the rest to assets. |
| `src/worker/routes/`        | One file per endpoint (health, models, config, chat).      |
| `src/worker/services/`      | Google AI client, validators, rate limit, logger.          |
| `src/worker/lib/`           | Model allowlist, response envelope, shared types.          |
| `wrangler.json`             | Cloudflare Worker config (assets, `ASSETS` binding).       |

Static assets are served first. `/api/*` is handled by Hono; every other path is
delegated to the `ASSETS` binding, which — with
`not_found_handling: "single-page-application"` — returns `index.html` so deep
links (e.g. `/playground`) work on direct load and refresh.

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
| `npm run typecheck`  | Type-check with `tsc -b` (what CI runs).          |
| `npm run check`      | tsc + build + `wrangler deploy --dry-run`.        |
| `npm run deploy`     | Deploy to Cloudflare Workers.                     |
| `npm run cf-typegen` | Regenerate the `Env` type after editing bindings. |

> Note: `npm run check` uses plain `tsc` (it does not deep-check the project
> references). For a true type-check run `npm run typecheck` (`tsc -b`), which is
> what CI runs.

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
