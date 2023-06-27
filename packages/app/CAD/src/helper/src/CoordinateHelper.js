/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 01:16:17
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/CoordinateHelper.js
 */
import { ArrowHelper, Group, Vector3 } from 'three';

class CoordinateHelper extends Group {
  constructor(colors = { x: 'red', y: 'green', z: 'blue' }, axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    super();
    this.colors = colors;
    this.axesLength = axesLength;
    this.arrowsLength = arrowsLength;
    this.arrowsWidth = arrowsWidth;
    this.type = 'CoordinateHelper';
    const pos = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
    const origin = new Vector3();
    ['x', 'y', 'z'].forEach((key) => {
      const arrow = new ArrowHelper(new Vector3(...pos[key]), origin, axesLength, colors[key], arrowsLength, arrowsWidth);
      arrow.renderOrder = Infinity;
      this.add(arrow);
    });
    this.isHelper = true
  }

  setLength(axesLength = 10, arrowsLength = 1, arrowsWidth = arrowsLength * 0.5) {
    this.traverse((child) => {
      child.setLength(axesLength, arrowsLength, arrowsWidth);
    });
  }

  dispose() {
    this.traverse((child) => {
      child.dispose();
    });
  }
}

export { CoordinateHelper };
