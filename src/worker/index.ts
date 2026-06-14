import { Hono } from "hono";
import { chat } from "./routes/chat";
import { config } from "./routes/config";
import { health } from "./routes/health";
import { models } from "./routes/models";

const app = new Hono<{ Bindings: Env }>();

// All API routes are mounted under /api/*. Non-API paths are served the built
// SPA by the Worker assets handler (see wrangler.json).
app.route("/api/health", health);
app.route("/api/models", models);
app.route("/api/config", config);
app.route("/api/chat", chat);

// Non-API routes fall through to the static assets. With
// not_found_handling: "single-page-application", unknown paths (e.g. deep links
// like /playground) resolve to index.html so client-side routing works on
// direct load and refresh.
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
