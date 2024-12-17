/* eslint-disable camelcase */
/*
 * @Date: 2023-07-17 15:58:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-19 20:05:27
 * @FilePath: /threejs-demo/packages/examples/polygonScale/computed2.js
 * @see: https://blog.csdn.net/qq_41261251/article/details/114462696
 */

import {
  BufferGeometry, Float16BufferAttribute, LineBasicMaterial, LineLoop, LineSegments, MeshBasicMaterial, Vector2,
} from 'three';
import {
  isComplexPolygon, vec2ToData, vec2ToVec3, vec2ToVec3Vertex,
} from '../lib/tools/index.js';
import { EarCut } from './Earcut.js';
import { SweepContext, Point } from '../lib/other/poly2tri.js';
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

/**
 * @description:
 * @param {*} loop 顺势针
 * @param {*} width
 * @param {*} scene
 * @return {*}
 */
export function polygonScale(loop, width, scene, method = 1) {
  try {
    if (isComplexPolygon(loop)) {
      throw new Error('loop is Knot');
    }

    const { upLine, downLine } = sortLoop(loop);
    loop = upLine.concat(downLine);

    let newLoop = handelLoop(upLine, downLine, width);
    console.log(newLoop, 444444);
    const sort = sortLoop(newLoop);
    newLoop = removeLineRepeatPoints(sort.upLine).concat(removeLineRepeatPoints(sort.downLine));
    console.log(newLoop, 555);
    const replaceLoop = removeCollinearPoints(removeCollinearPoints(newLoop));
    console.log(replaceLoop);
    if (isComplexPolygon(replaceLoop)) {
      console.log(scene);
      const g = new BufferGeometry().setAttribute('position', new Float16BufferAttribute(vec2ToVec3Vertex(replaceLoop, 0), 3));
      console.log(vec2ToVec3Vertex(replaceLoop, 0));
      scene.add(new LineLoop(g, new LineBasicMaterial({ color: 'red' })));
      throw new Error('newLoop is Knot');
    }

    const array = [];
    let position = [];

    if (method === 0) {
      useEarCut(loop, position, 1);
      array.push(position);
      position = [];
      useEarCut(replaceLoop, position, -1, true);
      array.push(position);
    } else {
      usePoly2tri(loop, position, 1);
      array.push(position);
      position = [];
      usePoly2tri(replaceLoop, position, -1, true);
      array.push(position);
    }
    position = [];

    console.log(loop, newLoop);

    addASide(vec2ToVec3(loop, 1), vec2ToVec3(newLoop, -1), position);
    array.push(position);
    return array;
  } catch (error) {
    console.error(error);
    return [];
  }
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

/**
 * @description: 对无效线段处理
 * @param {*} loop
 * @param {*} total
 * @return {*}
 */
function getBoundingBox(loop) {
  const min = new Vector2();
  const max = new Vector2();
  const index = { xMin: [], xMax: [], yMin: [], yMax: [] };
  for (let i = 0, l = loop.length; i < l; i++) {
    const v = loop[i];
    if (v.x >= max.x) {
      if (v.x > max.x) {
        index.xMax.length = 0;
      }
      max.x = v.x;
      index.xMax.push(i);
    }
    if (v.y >= max.y) {
      if (v.y > max.y) {
        index.yMax.length = 0;
      }
      max.y = v.y;
      index.yMax.push(i);
    }
    if (v.x <= min.x) {
      if (v.x < min.x) {
        index.xMin.length = 0;
      }
      min.x = v.x;
      index.xMin.push(i);
    }
    if (v.y <= min.y) {
      if (v.y < min.y) {
        index.yMin.length = 0;
      }
      min.y = v.y;
      index.yMin.push(i);
    }
  }

  console.log('max', max);
  console.log('min', min);
  console.log('index', index);

  return { max, min };
}

function handelLoop(upLine, downLine, width) {
  const { max, min } = getBoundingBox(upLine.concat(downLine));

  const scaleUpLine = [];
  const scaleDownLine = [];

  // up first
  scaleUpLine.push(new Vector2(upLine[0].x, upLine[0].y - width < 0 ? 0 : upLine[0].y - width));

  // up middle
  for (let i = 1, l = upLine.length - 1; i < l; i++) {
    const point = getResult(upLine[i - 1], upLine[i], upLine[i + 1], -width);

    point.y = point.y < 0 ? 0 : point.y;
    if (point.x > max.x) {
      point.x = max.x;
    } else if (point.x < min.x) {
      point.x = min.x;
    }
    scaleUpLine.push(point);
  }
  // up end
  scaleUpLine.push(new Vector2(upLine.at(-1).x, upLine.at(-1).y - width < 0 ? 0 : upLine.at(-1).y - width));

  // down first

  scaleDownLine.push(new Vector2(downLine[0].x, downLine[0].y + width > 0 ? 0 : downLine[0].y + width));

  // up middle
  for (let i = 1, l = downLine.length - 1; i < l; i++) {
    const point = getResult(downLine[i - 1], downLine[i], downLine[i + 1], -width);
    point.y = point.y > 0 ? 0 : point.y;
    if (point.x > max.x) {
      point.x = max.x;
    } else if (point.x < min.x) {
      point.x = min.x;
    }
    scaleDownLine.push(point);
  }
  // up end
  scaleDownLine.push(new Vector2(downLine.at(-1).x, downLine.at(-1).y + width > 0 ? 0 : downLine.at(-1).y + width));

  return scaleUpLine.concat(scaleDownLine);
}

function removeCollinearPoints(loop) {
  const result = [];
  const numPoints = loop.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = loop[i];
    const p2 = loop[(i + 1) % numPoints];
    const p3 = loop[(i + 2) % numPoints];

    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    if (Math.abs(v1.x * v2.y - v1.y * v2.x) >= 1e-12) {
      result.push(p2);
    }
  }

  return result;
}

function removeLineRepeatPoints(loop) {
  const result = [];
  const numPoints = loop.length;

  const xMap = new Map();

  for (let i = 0; i < numPoints; i++) {
    const v = loop[i];
    if (xMap.has(v.x)) {
      const yValue = xMap.get(v.x);
      if (!yValue.includes(v.y)) {
        yValue.push(v.y);
        xMap.set(v.x, yValue);
        result.push(v);
      }
    } else {
      xMap.set(v.x, [v.y]);
      result.push(v);
    }
  }

  return result;
}

function useEarCut(loop, position, h, isTranspose = false) {
  const data = vec2ToData(loop);
  const index = EarCut.triangulate(data);
  const vec3 = vec2ToVec3(loop, h);

  if (index.length === 0) {
    throw new Error('loop EarCut fail', loop);
  }

  if (!isTranspose) {
    for (let i = 0, l = index.length; i < l; i += 3) {
      const v1 = vec3[index[i]];
      const v2 = vec3[index[i + 1]];
      const v3 = vec3[index[i + 2]];
      position.push(v1.x, v1.y, v1.z);
      position.push(v2.x, v2.y, v2.z);
      position.push(v3.x, v3.y, v3.z);
    }
  } else {
    for (let i = 0, l = index.length; i < l; i += 3) {
      const v1 = vec3[index[i]];
      const v2 = vec3[index[i + 1]];
      const v3 = vec3[index[i + 2]];
      position.push(v3.x, v3.y, v3.z);
      position.push(v2.x, v2.y, v2.z);
      position.push(v1.x, v1.y, v1.z);
    }
  }
}

function usePoly2tri(loop, position, h, isTranspose = false) {
  const pathArray = [];
  for (let i = 0, j = loop.length; i < j; i++) {
    const v = loop[i];
    pathArray.push(new Point(v.x, v.y));
  }
  const swctx = new SweepContext(pathArray);
  swctx.triangulate();

  if (isTranspose) {
    swctx.getTriangles().forEach((t) => {
      t.getPoints().forEach((p) => {
        position.push(p.x, p.y, h);
      });
    });
  } else {
    swctx.getTriangles().forEach((t) => {
      const triangles = t.getPoints();
      for (let i = triangles.length - 1; i > 0; i--) {
        const p = triangles[i];
        position.push(p.x, p.y, h);
      }
    });
  }
}

/*
*
* up-----upNext
*  |    /|
*  |   / |
*  |  /  |                 up->down->upNext
*  | /   |                down->downNext->upNext
*  |/____|
* down   downNext
*/

function addASide(loopUp, loopDown, position) {
  console.log(loopUp, loopDown);
  if (loopUp.length !== loopDown.length) {
    // eslint-disable-next-line quotes
    throw new Error(`it is impassible!，Lost precision, target length is not equal result length ${loopDown.length}, ${loopUp.length}`);
  }
  for (let i = 0, l = loopUp.length; i < l; i++) {
    const up = loopUp[i % l];
    const upNext = loopUp[(i + 1) % l];
    const down = loopDown[i % l];
    const downNext = loopDown[(i + 1) % l];

    position.push(up.x, up.y, up.z);
    position.push(down.x, down.y, down.z);
    position.push(upNext.x, upNext.y, upNext.z);

    position.push(down.x, down.y, down.z);
    position.push(downNext.x, downNext.y, downNext.z);
    position.push(upNext.x, upNext.y, upNext.z);
  }
}

function sortLoop(loop) {
  let upLine = [];
  let downLine = [];
  loop.forEach((v) => {
    if (v.y > 0) {
      upLine.push(v);
    } else if (v.y < 0) {
      downLine.push(v);
    } else {
      downLine.push(v);
      upLine.push(v);
    }
  });

  upLine = upLine.sort((a, b) => a.x - b.x);
  downLine = downLine.sort((a, b) => b.x - a.x);

  return {
    upLine,
    downLine,
  };
}
