// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@typescript-eslint/no-explicit-any":        "off",
      "@typescript-eslint/no-unused-vars":         "off",
      "@typescript-eslint/no-empty-object-type":   "off",
      "@typescript-eslint/no-unsafe-function-type":"off",
    },
  }),

  // override for Prisma-generated type files
  {
    files: ["lib/generated/prisma/**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",   // silence TS rule here
      "no-unused-expressions":                    "off",   // silence core rule here
    },
  },
];
