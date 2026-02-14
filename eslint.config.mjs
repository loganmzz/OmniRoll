import nx from '@nx/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import tailwind from 'eslint-plugin-tailwindcss';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...tailwind.configs["flat/recommended"],
  {
    plugins: {
      '@stylistic': stylistic,
      import: importPlugin,
    },
  },
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],

    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/array-element-newline": ["error", {consistent: true, multiline: true}],
      "@stylistic/comma-dangle": ["error", "only-multiline"],
      "@stylistic/comma-spacing": "error",
      "@stylistic/comma-style": "error",
      "@stylistic/eol-last": "error",
      "@stylistic/no-tabs": "error",
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/object-curly-newline": [
        "error",
        {
          ImportDeclaration: {
            minProperties: 2,
            multiline: true,
          },
        },
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: 'always',
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        }
      ],
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
            orderImportKind: "asc",
          },
          named: {
            enabled: true,
            types: "types-first",
          },
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      'tailwindcss/no-custom-classname': 'off',
    },
  },
  {
    files: [
      '**/*.html',
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      // '**/*.css',
    ],
    rules: {
      '@stylistic/eol-last': ['error', 'always'],
    },
  },
];
