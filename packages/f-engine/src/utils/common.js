/*
 * @Date: 2023-06-25 10:49:17
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 18:15:08
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/common.js
 */
function isSameArray(v1, v2) {
  return stringify(v1.slice().sort()) === stringify(v2.slice().sort());
}

function parse(v) {
  return JSON.parse(v);
}

function stringify(v) {
  return JSON.stringify(v);
}

export {
  isSameArray,
  parse,
  stringify,
};