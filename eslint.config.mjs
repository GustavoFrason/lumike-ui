/**
 * Flat config (ESLint 9+). Existia um `.eslintrc.json` (formato legado)
 * paralelo a este arquivo — ESLint 9 não lê `.eslintrc.*` sem um shim de
 * compatibilidade, então `next lint`/`eslint` simplesmente não rodava.
 * `.eslintrc.json` foi removido; as regras que ele tinha por cima do
 * default do Next foram trazidas pra cá.
 */
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Delegado pro plugin unused-imports (abaixo), que também remove
      // import não usado automaticamente via --fix.
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@next/next/no-html-link-for-pages': 'warn',
      '@next/next/no-img-element': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'prefer-const': 'warn',
    },
  },
  // Desliga qualquer regra de estilo que brigue com o Prettier — o projeto
  // já usa Prettier (.prettierrc) como fonte de verdade pra formatação.
  prettierConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**']),
]);

export default eslintConfig;
