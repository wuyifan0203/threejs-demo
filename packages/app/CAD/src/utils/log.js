/*
 * @Date: 2023-06-21 18:27:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-27 17:52:10
 * @FilePath: /threejs-demo/packages/app/CAD/src/utils/log.js
 */

function printInfo(key) {
    console.count('info:'+key)
}

function print(...msg) {
    console.log(...msg)
}

function printDebugger(key) {
    console.count('debugger:'+key)
}

export {
    print,
    printInfo,
    printDebugger
}