import { DEFAULT_MODEL, isAllowedModel } from "../lib/models";
import type { ChatRequest } from "../lib/types";

export const MAX_MESSAGE_LENGTH = 8000;
export const MAX_SYSTEM_PROMPT_LENGTH = 4000;
export const MAX_BODY_BYTES = 32 * 1024; // 32 KB cap on the request body.

export const TEMPERATURE = { min: 0, max: 2, default: 0.4 };

export type ValidationResult =
	| { ok: true; value: ChatRequest }
	| { ok: false; code: string; message: string };

// Validates and normalizes an untrusted /api/chat body. Returns a safe,
// fully-typed ChatRequest or a structured error suitable for the client.
export function validateChatRequest(body: unknown): ValidationResult {
	if (typeof body !== "object" || body === null) {
		return {
			ok: false,
			code: "invalid_body",
			message: "Request body must be a JSON object.",
		};
	}

	const b = body as Record<string, unknown>;

	if (typeof b.model !== "string" || !isAllowedModel(b.model)) {
		return {
			ok: false,
			code: "invalid_model",
			message: "Unknown or unsupported model.",
		};
	}

	if (typeof b.message !== "string" || b.message.trim().length === 0) {
		return {
			ok: false,
			code: "invalid_message",
			message: "A non-empty message is required.",
		};
	}
	if (b.message.length > MAX_MESSAGE_LENGTH) {
		return {
			ok: false,
			code: "message_too_long",
			message: `Message exceeds ${MAX_MESSAGE_LENGTH} characters.`,
		};
	}

	let systemPrompt: string | undefined;
	if (b.systemPrompt !== undefined) {
		if (typeof b.systemPrompt !== "string") {
			return {
				ok: false,
				code: "invalid_system_prompt",
				message: "systemPrompt must be a string.",
			};
		}
		if (b.systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
			return {
				ok: false,
				code: "system_prompt_too_long",
				message: `System prompt exceeds ${MAX_SYSTEM_PROMPT_LENGTH} characters.`,
			};
		}
		systemPrompt = b.systemPrompt;
	}

	let temperature = TEMPERATURE.default;
	if (b.temperature !== undefined) {
		if (
			typeof b.temperature !== "number" ||
			Number.isNaN(b.temperature) ||
			b.temperature < TEMPERATURE.min ||
			b.temperature > TEMPERATURE.max
		) {
			return {
				ok: false,
				code: "invalid_temperature",
				message: `temperature must be between ${TEMPERATURE.min} and ${TEMPERATURE.max}.`,
			};
		}
		temperature = b.temperature;
	}

	return {
		ok: true,
		value: {
			model: b.model || DEFAULT_MODEL,
			message: b.message,
			systemPrompt,
			temperature,
		},
	};
}
