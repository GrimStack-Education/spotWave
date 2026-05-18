module.exports = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/dist/**', '**/build/**', '**/coverage/**', '**/.turbo/**'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['theme', 'custom-variant', 'tailwind', 'apply', 'layer', 'utility'],
      },
    ],
    'declaration-empty-line-before': null,
    'hue-degree-notation': null,
    'lightness-notation': null,
    'import-notation': null,
  },
};
