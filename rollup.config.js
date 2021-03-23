import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".json"];

export default {
	input: "src/index.tsx",
	output: [
		{
			dir: pkg.main,
			format: "cjs",
			exports: "named",
			sourcemap: true,
			globals: {
				react: "React",
				"react-dom": "ReactDOM",
			},
		},
		{
			dir: pkg.module,
			format: "esm",
			exports: "named",
			sourcemap: true,
			globals: {
				react: "React",
				"react-dom": "ReactDOM",
			},
		}
	],
	external: [/@babel\/runtime/],
	plugins: [
		image(),
		external({
			includeDependencies: true,
		}),
		postcss({
			modules: true
		}),
		babel({
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
			include: /node_modules/,
		})
	]
};
