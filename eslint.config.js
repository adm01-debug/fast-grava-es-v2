import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  { ignores: ["dist", "coverage", "scripts"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Critical: keep as errors
      "react-hooks/rules-of-hooks": "error",
      "no-debugger": "error",
      // Downgrade noisy pre-existing violations to warnings
      "no-console": "warn",
      "no-case-declarations": "warn",
      "no-empty": "warn",
      "no-useless-catch": "warn",
      "no-useless-escape": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // jsx-a11y: keep as warnings (large pre-existing codebase)
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/no-noninteractive-tabindex": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/aria-props": "warn",
    },
  },
  {
    files: ["src/lib/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["src/test/**", "tests/**"],
    rules: {
      "no-console": "off",
    },
  },
);
