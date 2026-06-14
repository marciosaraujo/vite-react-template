import type { ChatData } from "../lib/types";

interface Props {
	loading: boolean;
	error: string | null;
	data: ChatData | null;
}

export function ResponsePanel({ loading, error, data }: Props) {
	return (
		<section className="response-panel" aria-live="polite">
			<h2 className="panel-title">Response</h2>

			{loading && <p className="state state-loading">Waiting for the model…</p>}

			{!loading && error && (
				<p className="state state-error" role="alert">
					{error}
				</p>
			)}

			{!loading && !error && !data && (
				<p className="state state-empty">
					Send a prompt to see the model response here.
				</p>
			)}

			{!loading && !error && data && (
				<>
					<pre className="response-text">{data.text}</pre>
					<dl className="response-meta">
						<div>
							<dt>Model</dt>
							<dd>{data.model}</dd>
						</div>
						<div>
							<dt>Latency</dt>
							<dd>{data.durationMs} ms</dd>
						</div>
						<div>
							<dt>Length</dt>
							<dd>~{data.text.length} chars</dd>
						</div>
					</dl>
				</>
			)}
		</section>
	);
}
