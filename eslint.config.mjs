import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    ignores: ["node_modules/**"],
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
