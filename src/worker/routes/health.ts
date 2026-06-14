import { Hono } from "hono";
import { newRequestId, ok } from "../lib/response";

export const health = new Hono<{ Bindings: Env }>();

// Liveness + minimal readiness. Reports whether the API key binding is present
// WITHOUT ever exposing its value.
health.get("/", (c) => {
	const requestId = newRequestId();
	return c.json(
		ok(
			{
				status: "ok",
				keyConfigured: Boolean(c.env.GOOGLE_AI_API_KEY),
				time: new Date().toISOString(),
			},
			requestId,
		),
	);
});
