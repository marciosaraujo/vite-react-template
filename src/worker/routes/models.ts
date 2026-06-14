import { Hono } from "hono";
import { MODELS } from "../lib/models";
import { newRequestId, ok } from "../lib/response";

export const models = new Hono<{ Bindings: Env }>();

// Returns the allowlist of models the gateway will accept.
models.get("/", (c) => {
	return c.json(ok({ models: MODELS }, newRequestId()));
});
