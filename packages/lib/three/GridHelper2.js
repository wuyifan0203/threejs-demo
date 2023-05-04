/*
 * @Date: 2023-04-26 17:41:37
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-04-27 13:34:53
 * @FilePath: /threejs-demo/packages/lib/three/GridHelper2.js
 */
/*
 * @Date: 2023-04-26 17:41:37
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-04-27 11:28:53
 * @FilePath: /threejs-demo/packages/lib/three/GridHelper2.js
 */
import {
  LineSegments,
  Float32BufferAttribute,
  Color,
  BufferGeometry,
  LineBasicMaterial,
} from "./three.module.js";

class GridHelper extends LineSegments {
  constructor(size = 10, interval = 1, color = 0x444444) {
    color = new Color(color);

    const halfSize = size / 2;

    const vertices = [],
      colors = [];

    for (let i = 0, j = 0, k = -halfSize; k <= halfSize; i++, k += 1) {
      const x = halfSize * interval;
      const y = k * interval;
      vertices.push(-x, 0, y, x, 0, y);
      vertices.push(y, 0, -x, y, 0, x);

      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    const material = new LineBasicMaterial({
      vertexColors: true,
      toneMapped: false,
    });

    super(geometry, material);

    this.type = "GridHelper";
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export { GridHelper };
