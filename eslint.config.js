// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // Ban direct supabase.from() calls outside the services/ directory
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['services/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='supabase'][callee.property.name='from']",
          message:
            "Do not call supabase.from() directly. Use a service in services/ instead.",
        },
      ],
    },
  },
]);
