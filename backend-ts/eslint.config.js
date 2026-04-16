// // @ts-check

// import eslint from "@eslint/js";
// import tseslint from "typescript-eslint";

// export default tseslint.config(
//     eslint.configs.recommended,
//     tseslint.configs.recommended,
// );

// // @ts-check

// import eslint from "@eslint/js";
// import tseslint from "typescript-eslint";
// import perfectionist from "eslint-plugin-perfectionist";

// export default tseslint.config(
//     {
//         ignores: ["**/*.js"],
//     },
//     eslint.configs.recommended,
//     tseslint.configs.strictTypeChecked,
//     tseslint.configs.stylisticTypeChecked,
//     {
//         languageOptions: {
//             parserOptions: {
//                 projectService: true,
//                 tsconfigRootDir: import.meta.dirname,
//             },
//         },
//     },
//     perfectionist.configs["recommended-natural"],
// );

// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";
import vitest from "@vitest/eslint-plugin";

export default tseslint.config(
  {
    ignores: ["**/*.js"],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  //  IMPORT SORTING
  // perfectionist.configs["recommended-natural"],
  {
    plugins: {
      perfectionist,
    },
    rules: {
      "perfectionist/sort-imports": [
        "error",
        {
          // force #imports to always be INTERNAL
          internalPattern: ["^#.*"],

          groups: [
            "builtin",
            "external", // express goes here FIRST
            "internal", // #middlewares goes AFTER
            "parent",
            "sibling",
            "index",
          ],

          // newlinesBetween: "always",
          order: "asc",
          // extra safety
          type: "natural",
        },
      ],
    },
  },

  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/unbound-method": "off",
    },
  },
);
