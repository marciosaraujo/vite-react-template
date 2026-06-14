import { Hono } from "hono";
import { DEFAULT_MODEL } from "../lib/models";
import { newRequestId, ok } from "../lib/response";
import type { PublicConfig } from "../lib/types";
import { MAX_MESSAGE_LENGTH, TEMPERATURE } from "../services/validators";

export const config = new Hono<{ Bindings: Env }>();

// Returns ONLY safe, public configuration for the UI. Never includes secrets
// or the raw environment.
config.get("/public", (c) => {
	const payload: PublicConfig = {
		name: "AI Gateway Edge",
		defaultModel: DEFAULT_MODEL,
		maxMessageLength: MAX_MESSAGE_LENGTH,
		temperature: TEMPERATURE,
	};
	return c.json(ok(payload, newRequestId()));
});
