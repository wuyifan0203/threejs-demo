/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-28 13:44:26
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-28 14:18:13
 * @FilePath: \threejs-demo\src\lib\tools\Calculate.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Vector2, Vector3 } from '../three/three.module.js';

const { abs, max, min } = Math;
const EPSILON = 1e-6;
/**
 * @description: compare a and b is equal
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon
 * @return {boolean}
 */
const compare = (a, b, epsilon) => abs(a - b) <= epsilon;
/**
 * 判断两个值是否在允许的误差范围内相等
 * @param {number|Vector2|Vector3} a - 第一个值
 * @param {number|Vector2|Vector3} b - 第二个值
 * @param {number} epsilon - 允许的误差范围 默认为1e-6
 * @returns {boolean} 是否相等
 */
function equal(a, b, epsilon = EPSILON) {
  if (typeof a === 'number' && typeof b === 'number') {
    return compare(a, b, epsilon);
  }

  if (a instanceof Vector3 && b instanceof Vector3) {
    return (
      compare(a.x, b.x, epsilon) &&
      compare(a.y, b.y, epsilon) &&
      compare(a.z, b.z, epsilon)
    );
  }

  if (a instanceof Vector2 && b instanceof Vector2) {
    return compare(a.x, b.x, epsilon) && compare(a.y, b.y, epsilon);
  }

  console.error('params type must be number ,Vector3 or Vector2');
  return false;
}

/**
 * @description: 判断 a >= b
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon 1e-6
 * @return {boolean}
 */
function greaterEqual(a, b, epsilon = EPSILON) {
  return a > b || compare(a, b, epsilon);
}

/**
 * @description: 判断 a > b
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon 1e-6
 * @return {boolean}
 */
function greaterThan(a, b, epsilon = EPSILON) {
  return a > b && !compare(a, b, epsilon);
}

/**
 * @description: 判断 a <= b
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon 1e-6
 * @return {boolean}
 */
function lessEqual(a, b, epsilon = EPSILON) {
  return a < b || compare(a, b, epsilon);
}

/**
 * @description: 判断 a < b
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon 1e-6
 * @return {boolean}
 */
function lessThan(a, b, epsilon = EPSILON) {
  return a < b && !compare(a, b, epsilon);
}

/**
 * @description: 线性插值，用于在两个值之间平滑过渡
 * @param {number} x - 起始值 
 * @param {number} y - 结束值
 * @param {number} a - 插值系数 取值范围通常是 [0, 1]，用于控制从 x 到 y 的过渡
 * @return {number}
 */
function mix(x, y, a) {
  return (1 - a) * x + a * y;
}

/**
 * @description:  将 value 限制在 [minVal, maxVal] 范围内
 * @param {number} value
 * @param {number} minVal
 * @param {number} maxVal
 * @return {number}
 */
function clamp(value, minVal, maxVal) {
  return max(minVal, min(maxVal, value));
}

/**
 * @description: 如果 x < edge，返回 0，否则返回 1
 * @param {number} edge 边缘值
 * @param {number} value 检测值
 * @return {number}
 */
function step(edge, value) {
  return value < edge ? 0 : 1;
}

/**
 * @description: 在 edge0 和 edge1 之间进行平滑插值，返回 0 到 1 的值。
 * @param {number} edge0 
 * @param {number} edge1
 * @param {number} value
 * @return {number}
 */
function smoothstep(edge0, edge1, x) {
  let t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * @description: 返回浮点数的小数部分
 * @param {number} x
 * @return {number}
 */
function fract(x) {
  return x - Math.floor(x);
}

/**
 * @description: 返回一个值的符号，-1 表示负，1 表示正，0 表示零
 * @param {number} x
 * @return {number}
 */
function sign(x) {
  if (x > 0) return 1;
  else if (x < 0) return -1;
  else return 0;
}

/**
 * @description: 返回数值的符号位 true 表示正，false 表示负
 * @param {boolean} value
 * @return {number}
 */
function symbolFlag(value) {
  return value ? 1 : -1;
}


export {
  equal,
  greaterEqual,
  greaterThan,
  lessEqual,
  lessThan,
  mix,
  clamp,
  step,
  smoothstep,
  fract,
  sign,
  symbolFlag
};
