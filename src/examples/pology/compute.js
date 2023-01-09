/*
 * @Date: 2022-11-30 13:47:02
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2022-11-30 17:54:15
 * @FilePath: /aquaman/example/pology/compute.js
 */

function innerPoints(p1, p, p2, l) {
  const [x1, y1] = p1;
  const [x, y] = p;
  const [x2, y2] = p2;

  const _v1x = x - x1;
  const _v1y = y - y1;

  const v1x = x1 - x;
  const v1y = y1 - y;
  const n1 = normal(v1x, v1y);
  const nv1x = v1x / n1;
  const nv1y = v1y / n1;

  const v2x = x2 - x;
  const v2y = y2 - y;
  const n2 = normal(v2x, v2y);
  const nv2x = v2x / n2;
  const nv2y = v2y / n2;

  // cos = a.b/ |a|.|b|
  const cos = (nv1x * nv2x + nv1y * nv2y);

  const expend = -l / Math.sqrt((1 - cos) / 2);

  const vx = nv1x + nv2x;
  const vy = nv1y + nv2y;

  const n = normal(vx, vy);

  const k = expend / n;

  const c = isConvex([_v1x, _v1y], [v2x, v2y]) ? -k : k;

  const px = vx * c;
  const py = vy * c;

  return [px + x, py + y];
}

function expendPoints(p1, p, p2, expend) {
  let v1x = p1[0] - p[0];
  let v1y = p1[1] - p[1];
  const n1 = normal(v1x, v1y);
  v1x /= n1;
  v1y /= n1;

  let v2x = p2[0] - p[0];
  let v2y = p2[1] - p[1];
  const n2 = normal(v2x, v2y);
  v2x /= n2;
  v2y /= n2;

  const l = -expend / Math.sqrt((1 - (v1x * v2x + v1y * v2y)) / 2);

  let vx = v1x + v2x;
  let vy = v1y + v2y;

  const n = l / normal(vx, vy);
  vx *= n;
  vy *= n;

  return [vx + p[0], vy + p[1]];
}

function normal(x, y) {
  return Math.sqrt(x * x + y * y);
}

function isConvex(vec20, vec21) {
  return (vec20[0] * vec21[1] - vec20[1] * vec21[0]) > 0;
}

export {
  innerPoints,
  expendPoints
};
