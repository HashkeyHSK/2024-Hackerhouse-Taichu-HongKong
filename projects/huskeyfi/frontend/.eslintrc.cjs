module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    createDefaultProgram: true,
  },
  plugins: ["react-refresh", "@typescript-eslint", "prettier"],
  extends: [
    "next/core-web-vitals",
    "airbnb",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: [
    ".next",
    ".vscode",
    ".eslintrc.cjs",
    "next.config.mjs",
    "node_modules",
  ],
  rules: {
    "react/jsx-filename-extension": [
      1,
      { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    ],
    "react/function-component-definition": [
      2,
      { namedComponents: "arrow-function" },
    ],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/jsx-no-useless-fragment": "off",
    "react/require-default-props": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "off",
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "import/extensions": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "no-console": "off",
    "no-param-reassign": "off",
    "max-classes-per-file": "off",
    "consistent-return": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/lines-between-class-members": "off",
    "@typescript-eslint/no-unused-vars": "off",
    camelcase: "off",
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
    "import/parsers": { "@typescript-eslint/parser": [".ts"] },
  },
};