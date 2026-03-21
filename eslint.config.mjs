import pluginJs from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", "convex/_generated/**"],
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    },
    languageOptions: {
      sourceType: "module",
      globals: {
        alert: "readonly",
        console: "readonly",
        describe: "readonly",
        document: "readonly",
        expect: "readonly",
        fetch: "readonly",
        jest: "readonly",
        localStorage: "readonly",
        process: "readonly",
        requestAnimationFrame: "readonly",
        test: "readonly",
        window: "readonly",
        __dirname: "readonly"
      }
    }
  }
];
