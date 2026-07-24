import nx from '@nx/eslint-plugin';
import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  eslintPluginTailwindcss.configs['flat/recommended'] || eslintPluginTailwindcss.configs.recommended,
  {
    settings: {
      tailwindcss: {
        cssConfigPath: './src/styles.scss',
      },
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
