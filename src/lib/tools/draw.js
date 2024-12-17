/* eslint-disable no-unused-vars */
/*
 * @Date: 2022-11-30 09:27:19
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2022-11-30 10:09:14
 * @FilePath: /aquaman/example/draw.js
 */

import {
  Mesh,
  MeshBasicMaterial,
  ExtrudeGeometry,
  Shape,
  DoubleSide,
  Matrix4,
  Vector3,
  Quaternion,
  Euler,
  LineBasicMaterial,
  EdgesGeometry,
  BufferAttribute,
  BufferGeometry,
  MeshLambertMaterial
} from 'three';

function draw2dLine(k, b, z, domain = [-10, 10]) {
  const start = [domain[0], line2d(k, b, domain[0]), z];
  const end = [domain[1], line2d(k, b, domain[1]), z];
  return drawPath(start, end);
}

function line2d(k, b, x) {
  return k * x + b;
}

function drawPath(point1, point2) {
  // console.log(point1, point2);
  return new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array([...point1, 0, ...point2, 0]), 3));
}

export {
  draw2dLine,
  drawPath
};

