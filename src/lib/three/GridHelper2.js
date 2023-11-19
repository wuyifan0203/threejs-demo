/*
 * @Date: 2023-04-26 17:41:37
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-12 15:32:27
 * @FilePath: /threejs-demo/examples/src/lib/three/GridHelper2.js
 */
import {
  LineSegments,
  Float32BufferAttribute,
  BufferGeometry,
  LineDashedMaterial
} from "./three.module.js";

class DynamicGrid extends LineSegments {
  constructor(size, interval, color = '#919191') {
    const positions = new Float32BufferAttribute((size + 1) * 12, 3); // 3个值为一个点，2个点一条线，2条线一个格子 3 * 2 * 2
    // + 1 因为10个格子11条线
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', positions);
    const material = new LineDashedMaterial({
      color,
      toneMapped: false,
    });

    super(geometry, material);
    this.type = 'DynamicGrid';
    this.size = size;
    this.frustumCulled = false;
    this.updateInterval(interval);
  }

  updateInterval(interval) {
    this.interval = interval;
    const position = this.geometry.getAttribute('position');
    for (let j = 0, halfSize = this.size / 2, k = -halfSize; k <= halfSize; k += 1) {
      const x = halfSize * interval;
      const y = k * interval;
      position.setXYZ(j, -x, 0, y);
      j++;
      position.setXYZ(j, x, 0, y);
      j++;
      position.setXYZ(j, y, 0, -x);
      j++;
      position.setXYZ(j, y, 0, x);
      j++;
    }
    position.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export { DynamicGrid };
