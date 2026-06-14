import type {
	ApiResponse,
	ChatData,
	ChatRequest,
	ModelInfo,
	PublicConfig,
} from "./types";

// Thin client over the same-origin /api/* endpoints. The browser never talks to
// the model provider directly — only to our Worker.

class ApiError extends Error {
	code: string;
	requestId: string;
	constructor(code: string, message: string, requestId: string) {
		super(message);
		this.code = code;
		this.requestId = requestId;
	}
}

async function request<T>(
	path: string,
	init?: RequestInit,
): Promise<ApiResponse<T>> {
	const res = await fetch(`/api${path}`, {
		...init,
		headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
	});

	let body: ApiResponse<T>;
	try {
		body = (await res.json()) as ApiResponse<T>;
	} catch {
		throw new ApiError(
			"network_error",
			"Could not parse the server response.",
			"",
		);
	}

	if (!body.success || body.error) {
		throw new ApiError(
			body.error?.code ?? "unknown_error",
			body.error?.message ?? "Request failed.",
			body.requestId,
		);
	}
	return body;
}

export interface HealthData {
	status: string;
	keyConfigured: boolean;
	time: string;
}

export const api = {
	health: () => request<HealthData>("/health"),
	models: () => request<{ models: ModelInfo[] }>("/models"),
	config: () => request<PublicConfig>("/config/public"),
	chat: (payload: ChatRequest) =>
		request<ChatData>("/chat", {
			method: "POST",
			body: JSON.stringify(payload),
		}),
};

export { ApiError };
