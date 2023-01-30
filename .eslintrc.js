/*
 * @Date: 2023-01-30 18:00:18
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-30 18:31:02
 * @FilePath: /threejs-demo/.eslintrc.js
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': ['error', 'never', { js: 'always' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'dir'] }],
    'no-shadow': ['error', {
      builtinGlobals: false, hoist: 'functions', allow: [], ignoreOnInitialization: true,
    }],
    'no-use-before-define': ['error', {
      functions: true,
      classes: true,
      variables: true,
      allowNamedExports: false,
    }],
  },
};
