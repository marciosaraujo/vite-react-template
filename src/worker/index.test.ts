import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "./index";
import { _resetRateLimit } from "./services/rate-limit";

const env = { GOOGLE_AI_API_KEY: "AIzaTESTKEY0123456789" } as unknown as Env;

beforeEach(() => {
	_resetRateLimit();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("GET /api/health", () => {
	it("reports ok and whether the key is configured", async () => {
		const res = await app.request("/api/health", {}, env);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.success).toBe(true);
		expect(body.data.status).toBe("ok");
		expect(body.data.keyConfigured).toBe(true);
	});

	it("reports keyConfigured false when the binding is missing", async () => {
		const res = await app.request("/api/health", {}, {} as Env);
		const body = await res.json();
		expect(body.data.keyConfigured).toBe(false);
	});
});

describe("GET /api/models", () => {
	it("returns the model allowlist", async () => {
		const res = await app.request("/api/models", {}, env);
		const body = await res.json();
		expect(body.success).toBe(true);
		expect(Array.isArray(body.data.models)).toBe(true);
		expect(
			body.data.models.some((m: { id: string }) => m.id === "gemini-2.5-flash"),
		).toBe(true);
	});
});

describe("GET /api/config/public", () => {
	it("returns only safe public config", async () => {
		const res = await app.request("/api/config/public", {}, env);
		const body = await res.json();
		expect(body.data.name).toBe("AI Gateway Edge");
		expect(JSON.stringify(body)).not.toContain("AIza");
	});
});

function chatReq(payload: unknown) {
	return new Request("http://local/api/chat", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
	});
}

describe("POST /api/chat", () => {
	it("rejects an unknown model", async () => {
		const res = await app.request(
			chatReq({ model: "gpt-4", message: "hi" }),
			{},
			env,
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe("invalid_model");
	});

	it("rejects an empty message", async () => {
		const res = await app.request(
			chatReq({ model: "gemini-2.5-flash", message: "  " }),
			{},
			env,
		);
		expect(res.status).toBe(400);
		expect((await res.json()).error.code).toBe("invalid_message");
	});

	it("returns 503 when the key is not configured", async () => {
		const res = await app.request(
			chatReq({ model: "gemini-2.5-flash", message: "hi" }),
			{},
			{} as Env,
		);
		expect(res.status).toBe(503);
		expect((await res.json()).error.code).toBe("not_configured");
	});

	it("returns normalized data on success and never leaks the key", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					candidates: [{ content: { parts: [{ text: "Hello!" }] } }],
				}),
				{ status: 200 },
			),
		);
		const res = await app.request(
			chatReq({
				model: "gemini-2.5-flash",
				message: "hi",
				systemPrompt: "be brief",
			}),
			{},
			env,
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.success).toBe(true);
		expect(body.data.text).toBe("Hello!");
		expect(body.data.model).toBe("gemini-2.5-flash");
		expect(typeof body.data.durationMs).toBe("number");
		expect(JSON.stringify(body)).not.toContain("AIza");

		// The key must be sent to Google, not exposed to the client.
		const [, init] = vi.mocked(globalThis.fetch).mock.calls[0];
		expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe(
			"AIzaTESTKEY0123456789",
		);
	});

	it("maps an upstream failure to a safe 502", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("boom", { status: 500 }),
		);
		const res = await app.request(
			chatReq({ model: "gemini-2.5-flash", message: "hi" }),
			{},
			env,
		);
		expect(res.status).toBe(502);
		expect((await res.json()).error.code).toBe("upstream_error");
	});
});
