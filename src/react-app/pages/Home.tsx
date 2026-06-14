import { Link } from "react-router-dom";

export function Home() {
	return (
		<div className="page home">
			<section className="hero">
				<h1>AI Gateway Edge</h1>
				<p className="lede">
					A full-stack AI gateway running as a single Cloudflare Worker. The
					browser talks only to internal <code>/api/*</code> endpoints — your
					Google AI Studio key stays private in the Worker, never in the
					frontend.
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
