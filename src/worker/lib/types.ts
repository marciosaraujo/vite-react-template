// Shared API contract types for the AI Gateway.
// The frontend mirrors this contract in src/react-app/lib/types.ts.

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

// Standard response envelope returned by every endpoint.
export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error: ApiError | null;
	requestId: string;
}
