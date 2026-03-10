import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: { ...globals.browser },
    },
    plugins: { "@typescript-eslint": ts },
    rules: {
      ...ts.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: { parser: tsParser },
      globals: { ...globals.browser },
    },
    plugins: { svelte },
    rules: {
      ...svelte.configs.recommended.rules,
      "svelte/no-at-html-tags": "off",
      "no-inner-declarations": "off",
      "no-unused-vars": "off",
    },
  },
  {
    ignores: [".svelte-kit/", "build/", "node_modules/"],
  },
];
