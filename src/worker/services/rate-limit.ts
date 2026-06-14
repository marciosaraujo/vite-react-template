// Basic in-memory, fixed-window rate limiter keyed by client identifier
// (usually IP). State lives in the isolate, so this is best-effort protection
// against casual abuse on a public demo — not a hard distributed guarantee.
// For per-account quotas, back this with Durable Objects or KV later.

interface Window {
	count: number;
	resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

const buckets = new Map<string, Window>();

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
	const existing = buckets.get(key);

	if (!existing || now >= existing.resetAt) {
		const resetAt = now + WINDOW_MS;
		buckets.set(key, { count: 1, resetAt });
		return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
	}

	if (existing.count >= MAX_REQUESTS) {
		return { allowed: false, remaining: 0, resetAt: existing.resetAt };
	}

	existing.count += 1;
	return {
		allowed: true,
		remaining: MAX_REQUESTS - existing.count,
		resetAt: existing.resetAt,
	};
}

// Exposed for tests so windows don't leak between cases.
export function _resetRateLimit() {
	buckets.clear();
}
