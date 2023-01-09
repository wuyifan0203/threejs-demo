/*
 * @Date: 2022-12-23 10:57:11
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2022-12-23 10:59:34
 * @FilePath: /aquaman/example/Line2.js
 */
import { LineSegments2 } from './LineSegments2.js';
import { LineGeometry } from './LineGeometry.js';
import { LineMaterial } from './LineMaterial.js';

class Line2 extends LineSegments2 {
  constructor(geometry = new LineGeometry(), material = new LineMaterial({ color: Math.random() * 0xffffff })) {
    super(geometry, material);

    this.type = 'Line2';
  }
}

Line2.prototype.isLine2 = true;

export { Line2 };
