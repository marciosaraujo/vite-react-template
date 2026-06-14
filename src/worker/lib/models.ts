import type { ModelInfo } from "./types";

// Allowlist of models the gateway is permitted to call. Any model not in this
// list is rejected before we ever reach the provider, which keeps the gateway
// from being used as an open proxy.
export const MODELS: ModelInfo[] = [
	{
		id: "gemini-3.5-flash",
		label: "Gemini 3.5 Flash",
		description: "Newest fast, general-purpose model.",
	},
	{
		id: "gemini-3.1-pro-preview",
		label: "Gemini 3.1 Pro (preview)",
		description:
			"Most capable model for complex reasoning. Preview — may change.",
	},
	{
		id: "gemini-3.1-flash-lite",
		label: "Gemini 3.1 Flash Lite",
		description: "Newest lightweight, low-cost model for simple tasks.",
	},
	{
		id: "gemini-2.5-pro",
		label: "Gemini 2.5 Pro",
		description: "Stable high-capability model for complex reasoning.",
	},
	{
		id: "gemini-2.5-flash",
		label: "Gemini 2.5 Flash",
		description: "Stable, fast, low-cost general-purpose model. Default.",
	},
	{
		id: "gemini-2.5-flash-lite",
		label: "Gemini 2.5 Flash Lite",
		description: "Stable lightest and cheapest model for simple tasks.",
	},
];

// Stable default: fast, cheap, and battle-tested. Users can switch to a newer
// 3.x model in the Playground.
export const DEFAULT_MODEL = "gemini-2.5-flash";

const ALLOWED_IDS = new Set(MODELS.map((m) => m.id));

export function isAllowedModel(model: string): boolean {
	return ALLOWED_IDS.has(model);
}
