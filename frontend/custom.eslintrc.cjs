/* eslint-env node */
module.exports = {
  root: true,
  extends: ["plugin:stefnotch/all"],
  plugins: ["stefnotch"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    parser: {
      ts: "@typescript-eslint/parser",
    },
    project: ["./tsconfig.app.json"],
    tsconfigRootDir: __dirname,
    extraFileExtensions: [".vue"],
  },
  rules: {
    "stefnotch/no-floating-results": "error",
  },
};
