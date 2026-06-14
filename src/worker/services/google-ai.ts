import type { ChatRequest } from "../lib/types";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 30_000;

export type GoogleAiResult =
	| { ok: true; text: string }
	| { ok: false; code: string; message: string; status?: number };

// Minimal shape of the Gemini generateContent response we rely on.
interface GenerateContentResponse {
	candidates?: Array<{
		content?: { parts?: Array<{ text?: string }> };
		finishReason?: string;
	}>;
	promptFeedback?: { blockReason?: string };
}

// Calls Google AI Studio (Gemini) generateContent. The API key is read from the
// Worker environment and only ever travels in the outbound request to Google —
// it is never returned to the caller, logged, or surfaced in errors.
export async function generateContent(
	apiKey: string,
	req: ChatRequest,
): Promise<GoogleAiResult> {
	const url = `${BASE_URL}/${encodeURIComponent(req.model)}:generateContent`;

	const body: Record<string, unknown> = {
		contents: [{ role: "user", parts: [{ text: req.message }] }],
		generationConfig: { temperature: req.temperature },
	};
	if (req.systemPrompt) {
		body.system_instruction = { parts: [{ text: req.systemPrompt }] };
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	let res: Response;
	try {
		res = await fetch(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-goog-api-key": apiKey,
			},
			body: JSON.stringify(body),
			signal: controller.signal,
		});
	} catch (err) {
		if (err instanceof Error && err.name === "AbortError") {
			return {
				ok: false,
				code: "upstream_timeout",
				message: "The model took too long to respond.",
			};
		}
		return {
			ok: false,
			code: "upstream_unreachable",
			message: "Could not reach the model provider.",
		};
	} finally {
		clearTimeout(timeout);
	}

	if (!res.ok) {
		// Map provider status to a safe, generic message. We deliberately do not
		// forward the provider's raw error body, which can leak internal detail.
		const code =
			res.status === 429
				? "upstream_rate_limited"
				: res.status >= 500
					? "upstream_error"
					: "upstream_rejected";
		return {
			ok: false,
			code,
			message: "The model provider rejected the request.",
			status: res.status,
		};
	}

	let json: GenerateContentResponse;
	try {
		json = (await res.json()) as GenerateContentResponse;
	} catch {
		return {
			ok: false,
			code: "upstream_bad_response",
			message: "Invalid response from the model provider.",
		};
	}

	if (json.promptFeedback?.blockReason) {
		return {
			ok: false,
			code: "content_blocked",
			message: "The request was blocked by safety filters.",
		};
	}

	const text = json.candidates?.[0]?.content?.parts
		?.map((p) => p.text ?? "")
		.join("")
		.trim();

	if (!text) {
		return {
			ok: false,
			code: "empty_response",
			message: "The model returned an empty response.",
		};
	}

	return { ok: true, text };
}
