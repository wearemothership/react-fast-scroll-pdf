import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import polyfill from "rollup-plugin-node-polyfills";
import inject from "rollup-plugin-inject-process-env";
import { terser } from "rollup-plugin-terser";

const EXTENSIONS = ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'];

export default {
	input: "src/index.tsx",
	output: [
		{
			dir: "./dist/umd/",
			format: "umd",
			exports: "named",
			sourcemap: true,
			name: "FastScrollPDF",
			globals: {
				react: "React",
				"react-dom": "ReactDOM",
				lodash: "_",
				"pdfjs-dist": "pdfjs-dist",
				"pdfjs-dist/build/pdf.worker.entry": "pdfjsWorker",
				"pdfjs-dist/web/pdf_viewer": "pdf_viewer",
				immer: "immer",
				"react-html-parser": "ReactHTMLParser"
			},
		},
		{
			dir: "./dist/esm/",
			format: "esm",
			exports: "named",
			sourcemap: true,
			globals: {
				react: "React",
				"react-dom": "ReactDOM",
				lodash: "_",
				"pdfjs-dist": "pdfjs-dist",
				"pdfjs-dist/build/pdf.worker.entry": "pdfjsWorker",
				"pdfjs-dist/web/pdf_viewer": "pdf_viewer",
				immer: "immer",
				"react-html-parser": "ReactHTMLParser"
			},
		}
	],
	external: [/@babel\/runtime/, "lodash"],
	plugins: [
		image(),
		json(),
		polyfill(),
		postcss({
			modules: true
		}),
		external(),
		resolve({
			browser: true,
			preferBuiltins: true,
			extensions: EXTENSIONS
		}),
		commonjs(),
		typescript(),
		babel({
			exclude: 'node_modules/**',
			extensions: EXTENSIONS,
			babelHelpers: "runtime"
		}),
		inject({
			NODE_ENV: "production",
			NODE_DEBUG: "false"
		})
		// terser()
	]
};
