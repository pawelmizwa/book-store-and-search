module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "import"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/typescript",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "prettier/prettier": "warn",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-console": ["error", { allow: ["info", "warn", "error"] }],
    curly: "error",
    "no-restricted-imports": [
      "warn",
      {
        patterns: [".*"],
      },
    ],
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          {
            target: "./src/modules/*/domain/**",
            from: ["./src/modules/*/boundary/**", "./src/modules/*/implementation/**"],
            message: "Hex violation - domain should not depend on outside layers",
          },
          {
            target: "./src/modules/**/!(*spec.ts)",
            from: ["./src/modules/*/tests/**"],
            message: "Should not be imported into non test files",
          },
          {
            target: "./src/modules/identity",
            from: ["./src/modules"],
            except: ["./product/index.ts", "./identity"],
            message:
              "You should not import between modules directly - use only what is exported from index instead",
          },
          {
            target: "./src/modules/product",
            from: ["./src/modules"],
            except: ["./identity/index.ts", "./product"],
            message:
              "You should not import between modules directly - use only what is exported from index instead",
          },
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
};
