/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2023-06-19 14:33:10
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-09-12 14:40:03
 * @FilePath: /threejs-demo/src/lib/tools/dataFormat.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Vector2, Vector3 } from "../three/three.module.js";

/**
 * @description: Vector2转三维BUffer
 * @param {Vector2[]} pointList
 * @param {number} h
 * @return {number[]}
 */
function vec2ToVec3Vertex(pointList, h = 0) {
  const vertices = [];
  const { length } = pointList;
  for (let index = 0; index < length; index++) {
    const { x, y } = pointList[index];
    vertices.push(x, y, h);
  }
  return vertices;
}

/**
 * @description: 二维数组转Vector2数组
 * @param {[number,number][]} data
 * @return {Vector2[]}
 */
function arrayToVec2(data) {
  return data.map((d) => new Vector2(d[0], d[1]));
}

function array2DToVertex(data,h = 0) {
  const vertices = [];
  const { length } = data;
  for (let index = 0; index < length; index++) {
    const [x,y] = data[index];
    vertices.push(x, y, h);
  }
  return vertices;
}

/**
 * @description: 一维数组转二维向量
 * @param {number[]} data
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

/**
 * @description: Vector2数组转一维数组
 * @param {Vector2[]} data
 * @return {number[]}
 */
function vec2ToData(data) {
  const array = [];
  data.forEach(v => {
    array.push(v.x,v.y)
  });

  return array
}

/**
 * @description: Vector2数组转Vector3数组
 * @param {Vector2[]} data
 * @param {number} h
 * @return {Vector3[]}
 */
function vec2ToVec3(data,h) {
  const array = [];
  data.forEach(v => {
    array.push(new Vector3(v.x,v.y,h))
  });

  return array
}

export { 
    vec2ToVec3Vertex, 
    arrayToVec2,
    dataToVec2,
    array2DToVertex,
    vec2ToData,
    vec2ToVec3
 };
