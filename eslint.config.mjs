import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const rawConfig = [...compat.extends("next/core-web-vitals")];

// Remove the parser.parse function if it exists
const eslintConfig = rawConfig.map((config) => {
  if (config.parser && typeof config.parser.parse === "function") {
    const { parse, ...rest } = config.parser;
    config.parser = rest;
  }
  return config;
});

export default eslintConfig;
