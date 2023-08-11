/*
 * @Date: 2023-06-25 10:49:17
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-30 18:15:08
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/common.js
 */
function isSameArray(v1:Array<string>, v2:Array<string>) {
  return stringify(v1.slice().sort()) === stringify(v2.slice().sort());
}

function isSameSet(set1:Set<any>, set2:Set<any>) {
  if (set1.size !== set2.size) {
    return false;
  }

  for (let element of set1) {
    if (!set2.has(element)) {
      return false;
    }
  }

  return true;
}


function parse(v:string) {
  return JSON.parse(v);
}

function stringify(v:object) {
  return JSON.stringify(v);
}

export {
  isSameArray,
  isSameSet,
  parse,
  stringify,
};
