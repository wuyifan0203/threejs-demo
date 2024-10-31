import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      // common
      'no-console': ['warn', // 允许有warn，error，dir，其余的是警告
        { allow: ['warn', 'error', 'dir'] },
      ],
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
      // 使用指定语法
      'no-restricted-syntax': 0,
      // for in 是否做校验
      'guard-for-in': 0,
      //
      'class-methods-use-this': 0,
      'object-curly-newline': ['error', {
        ObjectExpression: { multiline: true, minProperties: 5 },
        ObjectPattern: { multiline: true, minProperties: 5 },
        ImportDeclaration: { multiline: true, minProperties: 3 },
        ExportDeclaration: { multiline: true, minProperties: 3 },
      }],
      // switch 后 是否有 default
      'default-case': ['error', { commentPattern: '^skip\\sdefault' }],
      // 是否允许匿名函数
      'func-names': 0,
    },
    ignorePatterns: ['**/build/**', '**/lib/three/**','**/lib/other/**'],
  }
];