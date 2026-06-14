import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "./index";
import { _resetRateLimit } from "./services/rate-limit";

const env = { GOOGLE_AI_API_KEY: "AIzaTESTKEY0123456789" } as unknown as Env;

// Response.json() is typed `unknown` under the worker tsconfig, so parse through
// a small typed helper instead of asserting on `unknown`.
async function body<T>(res: Response) {
	return (await res.json()) as {
		success: boolean;
		data: T;
		error: { code: string; message: string } | null;
		requestId: string;
	};
}

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
		const b = await body<{ status: string; keyConfigured: boolean }>(res);
		expect(b.success).toBe(true);
		expect(b.data.status).toBe("ok");
		expect(b.data.keyConfigured).toBe(true);
	});

	it("reports keyConfigured false when the binding is missing", async () => {
		const res = await app.request("/api/health", {}, {} as Env);
		const b = await body<{ keyConfigured: boolean }>(res);
		expect(b.data.keyConfigured).toBe(false);
	});
});

describe("GET /api/models", () => {
	it("returns the model allowlist", async () => {
		const res = await app.request("/api/models", {}, env);
		const b = await body<{ models: { id: string }[] }>(res);
		expect(b.success).toBe(true);
		expect(Array.isArray(b.data.models)).toBe(true);
		expect(b.data.models.some((m) => m.id === "gemini-2.5-flash")).toBe(true);
	});
});

describe("GET /api/config/public", () => {
	it("returns only safe public config", async () => {
		const res = await app.request("/api/config/public", {}, env);
		const b = await body<{ name: string }>(res);
		expect(b.data.name).toBe("AI Gateway Edge");
		expect(JSON.stringify(b)).not.toContain("AIza");
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
		const b = await body<null>(res);
		expect(b.error?.code).toBe("invalid_model");
	});

	it("rejects an empty message", async () => {
		const res = await app.request(
			chatReq({ model: "gemini-2.5-flash", message: "  " }),
			{},
			env,
		);
		expect(res.status).toBe(400);
		expect((await body<null>(res)).error?.code).toBe("invalid_message");
	});

	it("returns 503 when the key is not configured", async () => {
		const res = await app.request(
			chatReq({ model: "gemini-2.5-flash", message: "hi" }),
			{},
			{} as Env,
		);
		expect(res.status).toBe(503);
		expect((await body<null>(res)).error?.code).toBe("not_configured");
	});

	it("returns normalized data on success and never leaks the key", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					candidates: [{ content: { parts: [{ text: "Hello!" }] } }],
				}),
				{
					status: 200,
				},
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
		const b = await body<{ text: string; model: string; durationMs: number }>(
			res,
		);
		expect(b.success).toBe(true);
		expect(b.data.text).toBe("Hello!");
		expect(b.data.model).toBe("gemini-2.5-flash");
		expect(typeof b.data.durationMs).toBe("number");
		expect(JSON.stringify(b)).not.toContain("AIza");

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
		expect((await body<null>(res)).error?.code).toBe("upstream_error");
	});
});
