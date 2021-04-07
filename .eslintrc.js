module.exports = {
	env: {
		browser: true,
		es6: true,
		jest: true,
		"jest/globals": true
	},
	plugins: ["jest", "@typescript-eslint", "import"],
	extends: [
		"eslint-config-airbnb",
		"airbnb/hooks",
		"plugin:jest/recommended",
		"plugin:jest/style",
		"plugin:@typescript-eslint/recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
	],
	rules: {
		indent: [2, "tab", { SwitchCase: 1, VariableDeclarator: 1 }],
		"no-tabs": 0,
		"react/jsx-filename-extension": [2, { extensions: [".js", ".jsx", ".ts", ".tsx"] }],
		"react/no-did-update-set-state": 0,
		"react/static-property-placement": 0, // maybe re-enable?
		"react/prop-types": 0,
		"react/jsx-indent": [2, "tab"],
		"react/jsx-indent-props": [2, "tab"],
		"comma-dangle": 0, // WTF air-bnb?!,
		"no-param-reassign": ["error", { props: true, ignorePropertyModificationsFor: ["draft"] }],
		"import/no-unresolved": [2, {}],
		"import/no-extraneous-dependencies": [
			"error", {
				devDependencies: [
					"**/*.test.jsx",
					"**/*.test.js",
					"**/*.stories.jsx",
					".storybook/*",
					"rollup.config.js"
				]
			}],
		"linebreak-style": [
			"error",
			"unix"
		],
		"import/extensions": ["error", "never"],
		quotes: [
			"error",
			"double"
		],
		"no-console": "off",
		curly: [2, "all"],
		"brace-style": [2, "stroustrup"],
		semi: ["error", "always"],
		"react/jsx-props-no-spreading": [2, {
			custom: "ignore"
		}],
		"react/jsx-fragments": [2, "syntax"],
		"no-use-before-define": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"no-shadow": "off",
	},
	parserOptions: {
		sourceType: "module"
	},
	parser: "@typescript-eslint/parser",
	ignorePatterns: ["!.storybook"],
	settings: {
		"import/resolver": {
			node: {
				extensions: [".js", ".jsx", ".ts", ".tsx"],
				moduleDirectory: ["node_modules", "src/"],
			}
		}
	},
	overrides: [
		{
			// enable the rule specifically for TypeScript files
			files: ["*.ts", "*.tsx"],
			rules: {
				"@typescript-eslint/explicit-module-boundary-types": ["error"],
				"@typescript-eslint/no-use-before-define": ["error"],
				"@typescript-eslint/no-shadow": "error"
			}
		}
	]
};
