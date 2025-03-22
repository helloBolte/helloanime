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

// Convert legacy parser settings to flat config format
const eslintConfig = rawConfig.map((config) => {
  // If a legacy parser is defined at the root level, move it into languageOptions.parser
  if (config.parser) {
    config.languageOptions = config.languageOptions || {};

    // If the parser is an object (with potential function values), remove the function and set a supported parser string.
    if (typeof config.parser === "object") {
      if (typeof config.parser.parse === "function") {
        // Remove the unsupported function by ignoring the "parse" property.
        const { parse, ...rest } = config.parser;
        // You can replace with your preferred supported parser here.
        config.languageOptions.parser = "@babel/eslint-parser";
      } else {
        // Fallback: assign a supported parser string
        config.languageOptions.parser = "@babel/eslint-parser";
      }
    } else if (typeof config.parser === "string") {
      // If it's already a string, just move it.
      config.languageOptions.parser = config.parser;
    }
    // Remove the old parser key.
    delete config.parser;
  } else {
    // If no parser is defined at the root, ensure languageOptions exists and set a default parser.
    config.languageOptions = config.languageOptions || {};
    if (!config.languageOptions.parser) {
      config.languageOptions.parser = "@babel/eslint-parser";
    }
  }
  return config;
});

export default eslintConfig;
