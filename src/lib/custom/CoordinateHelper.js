/*
 * @Date         : 2023-07-13 13:30:06
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-25 15:19:30
 * @FilePath: \threejs-demo\src\lib\custom\CoordinateHelper.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

import { Group, Vector3 } from 'three';
import { Arrow } from './Arrow.js';

const pos = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const origin = new Vector3();
class CoordinateHelper extends Group {
  constructor(axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    super();
    this.colors = { x: 'red', y: 'green', z: 'blue' };
    this.axesLength = axesLength;
    this.arrowsLength = arrowsLength;
    this.arrowsWidth = arrowsWidth;
   
    ['x', 'y', 'z'].forEach((key) => {
      const arrow = new Arrow(
        new Vector3(...pos[key]),
        origin,
        axesLength,
        this.colors[key],
        arrowsLength,
        arrowsWidth,
      );
      arrow.axis = key;
      arrow.renderOrder = Infinity;
      this.add(arrow);
    });
  }

  setLength(axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    this.traverse((child) => {
      child.setLength(axesLength, arrowsLength, arrowsWidth);
    });
  }

  setColors(colors) {
    this.traverse((child) => {
      if (child instanceof Arrow) {
        child.setColor(colors[child.axis]);
      }
    });
  }
}

export { CoordinateHelper };
