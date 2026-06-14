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
				<span>AI Gateway Edge · by Márcio Araújo</span>
				<span className="footer-links">
					<a href="mailto:marcio@marcioaraujo.net">marcio@marcioaraujo.net</a>
					<a
						href="https://github.com/marciosaraujo"
						target="_blank"
						rel="noreferrer"
					>
						github.com/marciosaraujo
					</a>
				</span>
			</footer>
		</BrowserRouter>
	);
}

export default App;
