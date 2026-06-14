// Mirror of the backend API contract (src/worker/lib/types.ts). The frontend
// only ever knows about this internal contract — never the provider's shape.

export interface ChatRequest {
	model: string;
	systemPrompt?: string;
	message: string;
	temperature?: number;
}

export interface ChatData {
	text: string;
	model: string;
	durationMs: number;
}

export interface ModelInfo {
	id: string;
	label: string;
	description: string;
}

export interface PublicConfig {
	name: string;
	defaultModel: string;
	maxMessageLength: number;
	temperature: { min: number; max: number; default: number };
}

export interface ApiError {
	code: string;
	message: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error: ApiError | null;
	requestId: string;
}

// UI-side record of a single chat call, used by RequestStats.
export interface RequestRecord {
	requestId: string;
	model: string;
	ok: boolean;
	durationMs: number;
	at: string;
	errorCode?: string;
}
