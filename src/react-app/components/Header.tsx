import { NavLink } from "react-router-dom";

export function Header() {
	return (
		<header className="site-header">
			<NavLink to="/" className="brand">
				<span className="brand-mark">◇</span> AI Gateway Edge
			</NavLink>
			<nav className="site-nav">
				<NavLink to="/" end>
					Home
				</NavLink>
				<NavLink to="/playground">Playground</NavLink>
				<NavLink to="/architecture">Architecture</NavLink>
			</nav>
		</header>
	);
}
