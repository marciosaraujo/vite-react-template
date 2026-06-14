import type { ApiResponse } from "./types";

// Generates a short, non-sensitive request id used for correlating logs and
// responses. Not cryptographically meaningful.
export function newRequestId(): string {
	return `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function ok<T>(data: T, requestId: string): ApiResponse<T> {
	return { success: true, data, error: null, requestId };
}

export function fail(
	code: string,
	message: string,
	requestId: string,
): ApiResponse<never> {
	return { success: false, data: null, error: { code, message }, requestId };
}
