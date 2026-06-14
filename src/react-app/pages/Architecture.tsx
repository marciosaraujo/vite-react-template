export function Architecture() {
	return (
		<div className="page architecture">
			<h1>Architecture</h1>
			<p className="lede">
				One Cloudflare Worker serves the React SPA and the Hono API. The
				frontend never holds the provider credential.
			</p>

			<section>
				<h2>Request flow</h2>
				<ol className="flow">
					<li>The browser loads the React app served by the Worker.</li>
					<li>
						The UI calls <code>/api/chat</code> on the same origin.
					</li>
					<li>
						Hono validates the payload, applies rate limiting and reads the key
						from the Worker env.
					</li>
					<li>The Worker calls Google AI Studio with the private key.</li>
					<li>
						A normalized response is returned — the credential never reaches the
						browser.
					</li>
				</ol>
			</section>

			<section>
				<h2>Secret handling</h2>
				<ul className="bullets">
					<li>
						Local dev: key in <code>.dev.vars</code> (gitignored), never
						committed.
					</li>
					<li>
						Production: <code>wrangler secret put GOOGLE_AI_API_KEY</code> on
						the Worker.
					</li>
					<li>
						Never in <code>VITE_*</code>, the bundle, logs, or any response
						body.
					</li>
				</ul>
			</section>

			<section>
				<h2>Endpoints</h2>
				<table className="endpoints">
					<thead>
						<tr>
							<th>Endpoint</th>
							<th>Method</th>
							<th>Purpose</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<code>/api/health</code>
							</td>
							<td>GET</td>
							<td>Liveness + whether the key binding is present.</td>
						</tr>
						<tr>
							<td>
								<code>/api/models</code>
							</td>
							<td>GET</td>
							<td>Allowlist of enabled models.</td>
						</tr>
						<tr>
							<td>
								<code>/api/config/public</code>
							</td>
							<td>GET</td>
							<td>Safe, public config for the UI.</td>
						</tr>
						<tr>
							<td>
								<code>/api/chat</code>
							</td>
							<td>POST</td>
							<td>Validate, proxy to Google AI Studio, normalize the reply.</td>
						</tr>
					</tbody>
				</table>
			</section>

			<section>
				<h2>Abuse protection</h2>
				<ul className="bullets">
					<li>Strict body validation and a model allowlist.</li>
					<li>Payload size cap and a 30s upstream timeout.</li>
					<li>Best-effort per-IP rate limiting.</li>
					<li>Sanitized logs and generic, safe error messages.</li>
				</ul>
			</section>
		</div>
	);
}
