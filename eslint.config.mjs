import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "app",
    typescript: true,
    jsonc: true,
    formatters: false,
    stylistic: false,
    ignores: ["**/migrations/*"],
  },
  {
    rules: {
      "no-console": "off",
      "antfu/no-top-level-await": "off",
      "node/prefer-global/process": "off",
      "perfectionist/sort-imports": [
        "error",
        {
          internalPattern: ["^@/.*"],
        },
      ],
    },
  },
  {
    files: ["**/*.md"],
    rules: {
      "perfectionist/sort-imports": "off",
    },
  },
);
