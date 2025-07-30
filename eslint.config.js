import mothershipConfig from "@wearemothership/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	...mothershipConfig,
	{
		ignores: ["dist/**", "example/dist/**", "**/build/**"]
	}
]);