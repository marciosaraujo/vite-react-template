import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Architecture } from "./pages/Architecture";
import { Home } from "./pages/Home";
import { Playground } from "./pages/Playground";
import "./App.css";

function App() {
	return (
		<BrowserRouter>
			<Header />
			<main className="site-main">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/playground" element={<Playground />} />
					<Route path="/architecture" element={<Architecture />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
			<footer className="site-footer">
				<span>AI Gateway Edge</span>
				<span>React · Hono · Cloudflare Workers</span>
			</footer>
		</BrowserRouter>
	);
}

export default App;
