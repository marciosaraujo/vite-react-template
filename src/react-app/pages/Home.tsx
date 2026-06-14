import { Link } from "react-router-dom";

export function Home() {
	return (
		<div className="page home">
			<section className="hero">
				<h1>AI Gateway Edge</h1>
				<p className="lede">
					A full-stack AI gateway that runs entirely as a single Cloudflare
					Worker — a React frontend and a Hono API shipped in one build and one
					deploy. The browser only ever talks to internal <code>/api/*</code>{" "}
					endpoints, so your Google AI Studio key stays private in the backend
					and never reaches the client.
				</p>
				<p className="lede">
					It exists to show a clean pattern for putting AI behind your own API:
					test prompts across models, inspect latency and errors, and keep the
					provider credential out of the browser entirely — the kind of internal
					"model gateway" a DevOps/SRE team would actually run.
				</p>
				<div className="cta-row">
					<Link to="/playground" className="primary">
						Open the Playground
					</Link>
					<Link to="/architecture" className="ghost">
						How it works
					</Link>
				</div>
			</section>

			<section className="cards">
				<article className="card">
					<h3>Secrets stay backend</h3>
					<p>
						The key is read from the Worker environment and only ever travels to
						Google. No <code>VITE_*</code>, no key in the bundle, no direct
						browser calls.
					</p>
				</article>
				<article className="card">
					<h3>One edge deploy</h3>
					<p>
						React (Vite) and Hono share one build. The Worker serves the SPA for
						non-API paths and handles <code>/api/*</code> at the edge.
					</p>
				</article>
				<article className="card">
					<h3>Safe by default</h3>
					<p>
						Model allowlist, payload limits, request timeout, basic rate
						limiting and sanitized logs — abuse protection built in from the
						start.
					</p>
				</article>
			</section>

			<section className="why">
				<h2>Why this stack</h2>
				<div className="why-grid">
					<article className="card">
						<h3>React + Vite</h3>
						<p>
							A modern, reactive UI with instant HMR in development and a small,
							optimized production bundle.
						</p>
					</article>
					<article className="card">
						<h3>Hono</h3>
						<p>
							A tiny, fast web framework built for edge runtimes. Familiar
							Express-style routing and middleware, without the weight — and it
							runs natively on Workers.
						</p>
					</article>
					<article className="card">
						<h3>Cloudflare Workers</h3>
						<p>
							Serverless at the edge: low latency worldwide, automatic scaling,
							no servers to manage, and deploys that finish in seconds.
						</p>
					</article>
					<article className="card">
						<h3>TypeScript end to end</h3>
						<p>
							The same response contract is typed on both the frontend and the
							backend, so integration mistakes get caught at compile time.
						</p>
					</article>
				</div>
			</section>

			<section className="easy">
				<h2>Easy to run</h2>
				<p>
					One repository, one build, one deploy command (
					<code>npm run deploy</code>). Frontend and backend share the same
					origin, so there is no CORS, no separate infrastructure and no servers
					to maintain. Secrets live in <code>.dev.vars</code> locally and as
					Worker secrets in production.
				</p>
			</section>

			<section className="stack">
				<h2>Stack</h2>
				<p>
					React 19 · Vite · Hono · TypeScript · Cloudflare Workers · Google AI
					Studio (Gemini)
				</p>
			</section>
		</div>
	);
}
