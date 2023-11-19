/*
 * @Date: 2023-07-17 17:40:14
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-17 17:46:54
 * @FilePath: /threejs-demo/packages/examples/polygonScale/isInPolygon.js
 */

function isInPolygon(point, vs) {
  const { x, y } = point;
  let wn = 0;

  let res;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const { x: xi, y: yi } = vs[i];
    const { x: xj, y: yj } = vs[j];

    res = isLeft({ x: xj, y: yj }, { x: xi, y: yi }, { x, y });

    if (yj <= y) {
      if (yi > y) {
        if (res > 0) {
          wn++;
        }
      }
    } else if (yi <= y) {
      if (res < 0) {
        wn--;
      }
    }
  }
  return wn !== 0;
}

function isLeft(P0, P1, P2) {
  return ((P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y));
}

export { isInPolygon };
