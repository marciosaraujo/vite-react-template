// Minimal structured logger. Never log secrets: the API key must never reach
// the log stream. Values passed here are assumed already safe; as a defensive
// measure we redact anything that looks like a Google API key.

const KEY_PATTERN = /AIza[0-9A-Za-z_-]{10,}/g;

function redact(value: unknown): unknown {
	if (typeof value === "string")
		return value.replace(KEY_PATTERN, "[redacted]");
	if (value && typeof value === "object") {
		return JSON.parse(JSON.stringify(value).replace(KEY_PATTERN, "[redacted]"));
	}
	return value;
}

export interface LogFields {
	requestId?: string;
	[key: string]: unknown;
}

function emit(
	level: "info" | "warn" | "error",
	msg: string,
	fields?: LogFields,
) {
	const entry = { level, msg, ...((redact(fields) as object) ?? {}) };
	const line = JSON.stringify(entry);
	if (level === "error") console.error(line);
	else if (level === "warn") console.warn(line);
	else console.log(line);
}

export const logger = {
	info: (msg: string, fields?: LogFields) => emit("info", msg, fields),
	warn: (msg: string, fields?: LogFields) => emit("warn", msg, fields),
	error: (msg: string, fields?: LogFields) => emit("error", msg, fields),
};
