import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import babelEslintParser from "@babel/eslint-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Get the base ESLint config from Next.js
const rawConfig = [...compat.extends("next/core-web-vitals")];

// Convert legacy parser settings to the flat config format and assign a supported parser module.
const eslintConfig = rawConfig.map((config) => {
  // Ensure languageOptions exists.
  config.languageOptions = config.languageOptions || {};

  // Always assign the supported parser module (which is an object with parse() or parseForESLint() method).
  config.languageOptions.parser = babelEslintParser;

  // Remove any legacy "parser" key if it exists.
  if (config.parser) {
    delete config.parser;
  }
  return config;
});

export default eslintConfig;
