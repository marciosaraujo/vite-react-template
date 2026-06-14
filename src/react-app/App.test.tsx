import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
	// Default: API calls resolve to empty-but-valid envelopes so the Playground
	// can mount without network errors.
	vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
		const url = String(input);
		if (url.includes("/api/models")) {
			return new Response(
				JSON.stringify({
					success: true,
					data: { models: [] },
					error: null,
					requestId: "t",
				}),
			);
		}
		return new Response(
			JSON.stringify({
				success: true,
				data: {
					name: "AI Gateway Edge",
					defaultModel: "gemini-2.5-flash",
					maxMessageLength: 8000,
					temperature: { min: 0, max: 2, default: 0.4 },
				},
				error: null,
				requestId: "t",
			}),
		);
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("App", () => {
	it("renders the home hero by default", () => {
		render(<App />);
		expect(
			screen.getByRole("heading", { level: 1, name: "AI Gateway Edge" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /Open the Playground/i }),
		).toBeInTheDocument();
	});

	it("shows the global navigation", () => {
		render(<App />);
		expect(
			screen.getByRole("link", { name: "Playground" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Architecture" }),
		).toBeInTheDocument();
	});

	it("renders the playground when navigated to /playground", async () => {
		window.history.pushState({}, "", "/playground");
		render(<App />);
		expect(
			screen.getByRole("heading", { level: 1, name: "Playground" }),
		).toBeInTheDocument();
		await waitFor(() =>
			expect(globalThis.fetch).toHaveBeenCalledWith(
				"/api/models",
				expect.anything(),
			),
		);
		window.history.pushState({}, "", "/");
	});
});
