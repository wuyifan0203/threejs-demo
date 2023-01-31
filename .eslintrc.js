/*
 * @Date: 2023-01-30 18:00:18
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-31 18:08:22
 * @FilePath: /threejs-demo/.eslintrc.js
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // import plug
    'import/extensions': ['error', 'never', { js: 'always' }],
    'import/prefer-default-export': 0,

    // common
    'no-console': ['warn', {
      allow: ['warn', 'error', 'dir'], // 允许有warn，error，dir，其余的是警告
    }],
    // 是否允许变量重复命名
    'no-shadow': 0,
    // 是否在声明前使用
    'no-use-before-define': ['error', {
      functions: false, // 函数允许
      classes: true,
      variables: true,
      allowNamedExports: false,
    }],
    // 每行最大长度限制
    'max-len': 0,
    // 是否使用 ++
    'no-plusplus': 0,
    // 是否开启连等 let a = b = c
    'no-multi-assign': 0,
    // 是否使用表达式 && ||
    'no-unused-expressions': 0,
    // 是否可以对形参赋值
    'no-param-reassign': 0,
    // 是否允许下划线命名 let _a
    'no-underscore-dangle': 0,
    // 是否支持位运算
    'no-bitwise': 0,
    // 是否连续使用运算符 a && b || c
    'no-mixed-operators': 0,
    // 使用 continue
    'no-continue': 0,
  },
};
