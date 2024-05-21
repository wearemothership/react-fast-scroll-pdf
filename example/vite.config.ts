/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	// depending on your application, base can also be "/"
	base: "",
	plugins: [react(), viteTsconfigPaths()],
	optimizeDeps: {
		esbuildOptions: {
			target: "esnext",
		},
	},
	server: {
		// this ensures that the browser opens upon server start
		open: true,
		// this sets a default port to 3000
		port: 3000,
	},
});
