// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    'plugin:flowtype-errors/recommended',
    'plugin:testcafe/recommended',
    'plugin:jest/recommended',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
    'flowtype-errors',
    'testcafe',
    'jest'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': [2, "always"],
    "flowtype-errors/show-errors": 2,
    "comma-dangle": ["error", "always-multiline"],
    'vue/attribute-hyphenation': [2, 'never', { 'ignore': [] }]
  }
}
