import { Hono } from "hono";
import { fail, newRequestId, ok } from "../lib/response";
import type { ChatData } from "../lib/types";
import { generateContent } from "../services/google-ai";
import { logger } from "../services/logger";
import { checkRateLimit } from "../services/rate-limit";
import { MAX_BODY_BYTES, validateChatRequest } from "../services/validators";

export const chat = new Hono<{ Bindings: Env }>();

chat.post("/", async (c) => {
	const requestId = newRequestId();
	const clientId = c.req.header("cf-connecting-ip") ?? "unknown";

	// 1. Rate limit before doing any real work.
	const rl = checkRateLimit(clientId);
	if (!rl.allowed) {
		logger.warn("rate_limited", { requestId });
		c.header(
			"retry-after",
			String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
		);
		return c.json(
			fail("rate_limited", "Too many requests. Slow down.", requestId),
			429,
		);
	}

	// 2. Reject oversized bodies cheaply via the declared length.
	const declaredLength = Number(c.req.header("content-length") ?? "0");
	if (declaredLength > MAX_BODY_BYTES) {
		return c.json(
			fail("payload_too_large", "Request body is too large.", requestId),
			413,
		);
	}

	// 3. Parse + validate the untrusted body.
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json(
			fail("invalid_json", "Request body must be valid JSON.", requestId),
			400,
		);
	}

	const validation = validateChatRequest(body);
	if (!validation.ok) {
		return c.json(fail(validation.code, validation.message, requestId), 400);
	}

	// 4. Ensure the secret is configured before calling out.
	const apiKey = c.env.GOOGLE_AI_API_KEY;
	if (!apiKey) {
		logger.error("missing_api_key", { requestId });
		return c.json(
			fail(
				"not_configured",
				"The gateway is not configured to reach the model provider.",
				requestId,
			),
			503,
		);
	}

	// 5. Call the provider and normalize the response.
	const started = Date.now();
	const result = await generateContent(apiKey, validation.value);
	const durationMs = Date.now() - started;

	if (!result.ok) {
		logger.warn("upstream_failed", {
			requestId,
			code: result.code,
			status: result.status,
			model: validation.value.model,
			durationMs,
		});
		const httpStatus = result.code === "upstream_rate_limited" ? 429 : 502;
		return c.json(fail(result.code, result.message, requestId), httpStatus);
	}

	logger.info("chat_ok", {
		requestId,
		model: validation.value.model,
		durationMs,
	});

	const data: ChatData = {
		text: result.text,
		model: validation.value.model,
		durationMs,
	};
	return c.json(ok(data, requestId));
});
