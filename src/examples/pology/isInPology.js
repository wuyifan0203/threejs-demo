/*
 * @Date: 2022-11-29 19:08:50
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2022-11-29 20:16:07
 * @FilePath: /aquaman/example/pology/isInPology.js
 */

export {
  pointInPolygon
};

function pointInPolygon(point, vs) {
  const x = point[0]; const y = point[1];
  let wn = 0;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0]; const yi = vs[i][1];
    const xj = vs[j][0]; const yj = vs[j][1];

    if (yj <= y) {
      if (yi > y) {
        if (isLeft([xj, yj], [xi, yi], [x, y]) > 0) {
          wn++;
        }
      }
    } else {
      if (yi <= y) {
        if (isLeft([xj, yj], [xi, yi], [x, y]) < 0) {
          wn--;
        }
      }
    }
  }
  return wn !== 0;
};

function isLeft(P0, P1, P2) {
  const res = ((P1[0] - P0[0]) * (P2[1] - P0[1]) -
            (P2[0] - P0[0]) * (P1[1] - P0[1]));
  return res;
}
