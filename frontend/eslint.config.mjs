import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The newer React Compiler-era hook rules (shipped with the upgraded
    // eslint-plugin-react-hooks) flag intentional, well-understood patterns
    // such as syncing external state on mount inside an effect. We surface
    // them as warnings so they stay visible without failing the build/CI.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/use-memo": "warn",
    },
  },
]);

export default eslintConfig;
