import type { RequestRecord } from "../lib/types";

interface Props {
	records: RequestRecord[];
}

// Session-only history of calls made from this browser tab. Nothing is
// persisted server-side in the MVP.
export function RequestStats({ records }: Props) {
	if (records.length === 0) return null;

	const ok = records.filter((r) => r.ok).length;
	const avg = Math.round(
		records.reduce((s, r) => s + r.durationMs, 0) / records.length,
	);

	return (
		<section className="request-stats">
			<h2 className="panel-title">Session activity</h2>
			<div className="stat-row">
				<div className="stat">
					<span className="stat-value">{records.length}</span>
					<span className="stat-label">calls</span>
				</div>
				<div className="stat">
					<span className="stat-value">{ok}</span>
					<span className="stat-label">ok</span>
				</div>
				<div className="stat">
					<span className="stat-value">{records.length - ok}</span>
					<span className="stat-label">errors</span>
				</div>
				<div className="stat">
					<span className="stat-value">{avg}</span>
					<span className="stat-label">avg ms</span>
				</div>
			</div>
			<ul className="stat-history">
				{records.slice(0, 8).map((r) => (
					<li key={r.requestId} className={r.ok ? "ok" : "err"}>
						<code>{r.model}</code>
						<span>
							{r.ok ? `${r.durationMs} ms` : (r.errorCode ?? "error")}
						</span>
						<time>{new Date(r.at).toLocaleTimeString()}</time>
					</li>
				))}
			</ul>
		</section>
	);
}
