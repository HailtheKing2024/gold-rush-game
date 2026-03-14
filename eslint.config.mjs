import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    },
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly"
      }
    }
  }
];
