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

export default app;
