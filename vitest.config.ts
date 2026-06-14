import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		// Two projects so each layer runs in the right environment:
		// React component tests need a DOM (jsdom); worker tests run in node.
		projects: [
			{
				extends: true,
				test: {
					name: "react-app",
					environment: "jsdom",
					include: ["src/react-app/**/*.test.{ts,tsx}"],
				},
			},
			{
				extends: true,
				test: {
					name: "worker",
					environment: "node",
					include: ["src/worker/**/*.test.ts"],
				},
			},
		],
	},
});
