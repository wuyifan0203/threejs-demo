/*
 * @Date: 2023-09-06 14:46:43
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 14:47:26
 * @FilePath: /threejs-demo/packages/f-utils/src/others/common.ts
 */


function deepClone(value:object) {
    return JSON.parse(JSON.stringify(value))
}

export {deepClone}