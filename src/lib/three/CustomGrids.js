/*
 * @Date: 2023-11-21 16:26:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-23 14:42:48
 * @FilePath: /threejs-demo/src/lib/three/customGrid.js
 */

import {
  LineSegments,
  LineBasicMaterial,
  Float32BufferAttribute,
  BufferGeometry,
  Color
} from './three.module.js';

class CustomGrid extends LineSegments {
  constructor(width = 10, height = 10, dx = 1, dy = 1, color1 = 0xaaaaaa, color2 = 0xdfdfdf) {
    color1 = new Color(color1);
    color2 = new Color(color2);
    const [w, h] = [width, height];

    const [centerX, centerY] = [w / 2, h / 2];

    const [halfW, halfH] = [w / 2, h / 2];

    const [timesX, timesY] = [w / dx, h / dy];

    const vertices = [];
    const colors = [];
    let c = 0;

    for (let i = 0, k = -halfW; i <= timesX; i++, k += dx) {
      vertices.push(k, -halfH, 0, k, halfH, 0);

      const color = i === centerX ? color1 : color2;
      color.toArray(colors, c); c += 3;
      color.toArray(colors, c); c += 3;
    }

    for (let j = 0, k = -halfH; j <= timesY; j++, k += dy) {
      vertices.push(-halfW, k, 0, halfW, k, 0);

      const color = j === centerY ? color1 : color2;
      color.toArray(colors, c); c += 3;
      color.toArray(colors, c); c += 3;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    const material = new LineBasicMaterial({ vertexColors: true, toneMapped: false });

    super(geometry, material);

    this.type = 'CustomGrid';
  }

  copy(source){
    super.copy(source);
    console.log(source);
    
  }
}

export { CustomGrid };
