import { describe, it, expect } from "vitest";
import app from "./index";

describe("worker", () => {
	it("GET /api/ returns the name as JSON", async () => {
		const res = await app.request("/api/");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ name: "Cloudflare" });
	});

	it("unknown routes fall through to 404", async () => {
		const res = await app.request("/does-not-exist");
		expect(res.status).toBe(404);
	});
});
