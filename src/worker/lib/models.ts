import type { ModelInfo } from "./types";

// Allowlist of models the gateway is permitted to call. Any model not in this
// list is rejected before we ever reach the provider, which keeps the gateway
// from being used as an open proxy.
export const MODELS: ModelInfo[] = [
	{
		id: "gemini-2.5-flash",
		label: "Gemini 2.5 Flash",
		description: "Fast, low-cost general-purpose model. Good default.",
	},
	{
		id: "gemini-2.5-pro",
		label: "Gemini 2.5 Pro",
		description: "Most capable model for complex reasoning.",
	},
	{
		id: "gemini-2.5-flash-lite",
		label: "Gemini 2.5 Flash Lite",
		description: "Lightest and cheapest model for simple tasks.",
	},
];

export const DEFAULT_MODEL = "gemini-2.5-flash";

const ALLOWED_IDS = new Set(MODELS.map((m) => m.id));

export function isAllowedModel(model: string): boolean {
	return ALLOWED_IDS.has(model);
}
