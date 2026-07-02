import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // This is a modern JS (non-TS) codebase that leans on a shared UI kit;
      // runtime prop-types add noise without type-checking value.
      "react/prop-types": "off",
    },
  },
  {
    // Test files: anonymous stub components in vi.mock factories trip
    // display-name, and test modules legitimately export non-components.
    files: ["src/**/*.test.{js,jsx}", "src/test/**"],
    rules: {
      "react/display-name": "off",
      "react-refresh/only-export-components": "off",
    },
  },
];
