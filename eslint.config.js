import globals from "globals";
import js from "@eslint/js";

export default [
  // 基础配置
  {
    languageOptions: {
      globals: { ...globals.browser }, // 浏览器环境全局变量
      sourceType: "module",            // ES 模块语法支持
      ecmaVersion: "latest"            // 最新 ECMAScript 版本
    },
    ignores: [                         // 替换旧版 ignorePatterns[1](@ref)
      "**/build/**",
      "**/lib/three/**",
      "**/lib/other/**"
    ],
  },

  // 继承推荐规则集
  js.configs.recommended,              // 使用 @eslint/js 替代旧版 eslint:recommended[5](@ref)

  // 自定义规则
  {
    rules: {
      /* 控制台规则 */
      "no-console": ["warn", { allow: ["warn", "error", "dir"] }],

      /* 变量与作用域 */
      "no-shadow": "off",
      "no-use-before-define": ["error", {
        functions: false,
        classes: true,
        variables: true,
        allowNamedExports: false
      }],

      /* 代码风格 */
      "max-len": "off",
      "object-curly-newline": ["error", {
        ObjectExpression: { multiline: true, minProperties: 5 },
        ObjectPattern: { multiline: true, minProperties: 5 },
        ImportDeclaration: { multiline: true, minProperties: 3 },
        ExportDeclaration: { multiline: true, minProperties: 3 }
      }],

      /* 操作符与表达式 */
      "no-plusplus": "off",
      "no-multi-assign": "off",
      "no-unused-expressions": "off",
      "no-bitwise": "off",
      "no-mixed-operators": "off",

      /* 函数与类 */
      "func-names": "off",
      "class-methods-use-this": "off",

      /* 流程控制 */
      "no-continue": "off",
      "no-restricted-syntax": "off",
      "guard-for-in": "off",
      "default-case": ["error", { commentPattern: "^skip\\sdefault" }],

      /* 其他 */
      "no-param-reassign": "off",
      "no-underscore-dangle": "off"
    }
  }
];