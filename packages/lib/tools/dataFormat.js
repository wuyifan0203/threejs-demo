/*
 * @Date: 2023-06-19 14:33:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-19 15:00:37
 * @FilePath: /threejs-demo/packages/lib/tools/dataFormat.js
 */

import { Vector2 } from "../three/three.module.js";
function vec2ToVec3Vertex(pointList, h = 0) {
  const vertices = [];
  const { length } = pointList;
  for (let index = 0; index < length; index++) {
    const { x, y } = pointList[index];
    vertices.push(x, y, h);
  }
  return vertices;
}

function arrayToVec2(data) {
  return data.map((d) => new Vector2(d[0], d[1]));
}

/**
 * @description: 一维数组转二维向量
 * @param {Array<number>} data
 * @return {Vector2[]}
 * @example  
 *  let data = [1,2,3,4,5,6];
 *  dataToVec2(data);
 *  // -> [Vector2(1,2),Vector2(3,4),Vector2(5,6)]
 */
function dataToVec2(data){
    const res = []
    for (let i = 0,l = data.length; i < l; i+=2) {
        res.push(new Vector2(data[i],data[i+1]))
    }
    return res
}

export { 
    vec2ToVec3Vertex, 
    arrayToVec2,
    dataToVec2
 };