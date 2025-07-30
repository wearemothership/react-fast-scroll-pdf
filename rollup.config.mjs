 
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image";
import babelPlugin from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";

const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".json"];

export default {
	input: "src/index.ts",
	output: [
		{
			file: "./dist/index.js",
			format: "umd",
			name: "FastScrollPDF",
			exports: "named",
			sourcemap: true,
			globals: {
				react: "React",
				"react-dom": "ReactDOM",
				"pdfjs-dist": "pdfjsLib",
				"pdfjs-dist/web/pdf_viewer.mjs": "pdf_viewer_mjs",
				"pdfjs-dist/build/pdf.worker.mjs": "pdf.worker",
				lodash: "_",
				immer: "immer",
				"html-react-parser": "parse"
			}
		},
		{
			file: "./dist/index.module.js",
			format: "esm",
			exports: "named",
			sourcemap: true,
			globals: {
				react: "React",
				"react-dom": "ReactDOM",
				"pdfjs-dist": "pdfjsLib",
				"pdfjs-dist/web/pdf_viewer.mjs": "pdf_viewer_mjs",
				"pdfjs-dist/build/pdf.worker.mjs": "pdf.worker",
				lodash: "_",
				immer: "immer",
				"html-react-parser": "parse"
			}
		}
	],
	external: [/@babel\/runtime/],
	plugins: [
		image(),
		external({
			includeDependencies: true
		}),
		postcss({
			modules: true
		}),
		babelPlugin({
			exclude: "node_modules/**",
			extensions: EXTENSIONS,
			babelHelpers: "runtime"
		}),
		json(),
		resolve({
			preferBuiltins: true,
			extensions: EXTENSIONS
		}),
		typescript(),
		commonjs({
			include: /node_modules/
		})
	]
};
