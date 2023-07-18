/*
 * @Date: 2023-07-17 15:58:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-17 17:58:51
 * @FilePath: /threejs-demo/packages/examples/polygonScale/computed2.js
 * @see: https://blog.csdn.net/qq_41261251/article/details/114462696
 */

import { Vector2 } from '../../lib/three/three.module.js';
//
// R       P        T
// .-------.--------.
//    e1       e2
//
//
/* 假设缩进距离为R，轮廓点 P 的缩进点表示为Q
 * R表示P 前一个轮廓点
 * T表示P 后一个轮廓点
 * θ 表示 RP 与 PT 的夹角
 * e1 和 e2 分别表示 R指向P，和P指向T的单位向量
 */

export function polygonScale(loop, width) {
  const total = [];
  // first
  total.push(getResult(loop.at(-1), loop[0], loop[1], width));
  // middle
  for (let j = 1, k = loop.length - 1; j < k; j++) {
    total.push(getResult(loop[j - 1], loop[j], loop[j + 1], width));
  }
  // end
  total.push(getResult(loop.at(-2), loop.at(-1), loop[0], width));

  console.log(total);

  return total;
}

function getResult(R, P, T, width) {
  const e1 = getVectorNormal(P, R);
  const e2 = getVectorNormal(T, P);

  const normalPR = getVectorNormal(R, P);
  const normalPT = getVectorNormal(T, P);

  const cos = normalPR.dot(normalPT);

  // Q = P + (e1-e2 / |e1- e2|) * (R / sin(theta / 2))

  const sin = Math.sqrt((1 - cos) / 2);

  const dir = normalPR.cross(normalPT) > 0 ? 1 : -1;

  const Q = new Vector2().copy(P).add(getVectorNormal(e1, e2).multiplyScalar(dir * width / sin));

  return Q;
}

function getVectorNormal(v1, v2) {
  return new Vector2().subVectors(v1, v2).normalize();
}
