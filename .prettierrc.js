module.exports = {
  // Base Prettier configuration
  arrowParens: "avoid",
  trailingComma: "es5",
  printWidth: 100,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,

  // Plugins for different file types
  plugins: ["prettier-plugin-tailwindcss"],

  // Override for specific paths
  overrides: [
    {
      files: ["frontend/**/*.{js,jsx,ts,tsx}"],
      options: {
        plugins: ["prettier-plugin-tailwindcss"],
      },
    },
  ],
};
