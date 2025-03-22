import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Get the base ESLint config from Next.js
const rawConfig = [...compat.extends("next/core-web-vitals")];

// Process each config object to ensure no unsupported function values are present
const eslintConfig = rawConfig.map((config) => {
  if (config.parser && typeof config.parser === "object") {
    // Remove any function values from the parser object (specifically the "parse" function)
    if (typeof config.parser.parse === "function") {
      const { parse, ...rest } = config.parser;
      config.parser = rest;
    }
    // Set a supported parser if one is not already specified as a string
    // Here we set it explicitly to @babel/eslint-parser; change it if needed.
    if (typeof config.parser !== "string") {
      config.parser = "@babel/eslint-parser";
    }
  } else if (!config.parser) {
    // If no parser is defined, set one explicitly
    config.parser = "@babel/eslint-parser";
  }
  return config;
});

export default eslintConfig;
