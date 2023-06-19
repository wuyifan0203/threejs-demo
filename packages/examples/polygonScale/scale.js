/*
 * @Date: 2023-06-16 10:27:02
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-19 16:34:39
 * @FilePath: /threejs-demo/packages/examples/polygonScale/scale.js
 */

/**
 * @description: 计算多边形的扩展
 * @param {path} shape 包含路径和洞。路径必须为逆时针
 * @param {number} width
 * @return {*}
 */
function polygonScale(path, width) {
  function compute(p1, p, p2) {
    const p1_p = { x: p1.x - p.x, y: p1.y - p.y };
    const n_p1p = normal(p1_p);
    p1_p.x /= n_p1p;
    p1_p.y /= n_p1p;

    const p2_p = { x: p2.x - p.x, y: p1.x - p.y };
    const n_p2p = normal(p2_p);
    p2_p.x /= n_p2p;
    p2_p.y /= n_p2p; 


    const pq = { x: p1_p.x + p2_p.x, y: p1_p.y + p2_p.y };

    // 计算扩展距离
    const expend = -width / Math.sqrt((1 - (p1_p.x * p2_p.x + p1_p.y * p2_p.y)) / 2);

    // 判断是凹角还是凸角
    const c = isConvex(p1_p, p2_p) ? -(expend / normal(pq)) : (expend / normal(pq));

    return {
      x: pq.x * c + p.x,
      y: pq.y * c + p.y,
    };
  }

  const length = path.length;
  const result = [];
  result.push(compute(path.at(-1), path[0], path[1]));
  for (let i = 1, l = length - 1; i < l; i++) {
    result.push(compute(path[i - 1], path[i], path[i + 1]));
  }
  result.push(compute(path.at(-2), path.at(-1), path[0]));

  return result;
}

function normalize(point) {
  const { x, y } = point;
  const b = Math.sqrt(x * x + y * y);
  return { x: x / b, y: y / b };
}

function normal(v2) {
  return v2.x * v2.x + v2.y * v2.y;
}

function isConvex(vec2_0, vec2_1) {
  return vec2_0.x * vec2_1.y - vec2_0.y * vec2_1.x > 0;
}

export { polygonScale };
