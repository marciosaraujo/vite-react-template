import { describe, it, expect, vi, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from "@testing-library/react";
import App from "./App";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("App", () => {
	it("increments the counter on click", () => {
		render(<App />);
		const btn = screen.getByLabelText("increment");
		expect(btn).toHaveTextContent("count is 0");
		fireEvent.click(btn);
		expect(btn).toHaveTextContent("count is 1");
	});

	it("fetches the name from the API and displays it", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ name: "Test" })),
		);
		render(<App />);
		const btn = screen.getByLabelText("get name");
		expect(btn).toHaveTextContent("Name from API is: unknown");
		fireEvent.click(btn);
		await waitFor(() =>
			expect(btn).toHaveTextContent("Name from API is: Test"),
		);
		expect(globalThis.fetch).toHaveBeenCalledWith("/api/");
	});
});
