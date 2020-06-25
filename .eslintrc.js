module.exports = {
  plugins: ['@typescript-eslint', 'no-null'],
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    project: './tsconfig-test.json'
  },
  extends: [
    'escapace'
  ],
  rules: {
    '@typescript-eslint/method-signature-style': 0,
    'prefer-object-spread': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/space-before-function-paren': 0
  }
}
