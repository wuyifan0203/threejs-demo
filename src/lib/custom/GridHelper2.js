/*
 * @Date: 2023-04-26 17:41:37
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 13:14:31
 * @FilePath: /threejs-demo/src/lib/three/GridHelper2.js
 */
import {
  LineSegments,
  Float32BufferAttribute,
  BufferGeometry,
  LineDashedMaterial,
  Vector3
} from "three";

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
    this.unit = 0;

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

  update(target, camera, dom) {
    const { x: unit } = getInterval(camera, dom);
    const { x, y } = getY(unit);
    this.unit = unit;

    let gridUnit = 5;
    if (y === 1) {
      gridUnit = 1 * x;
    } else if (y === 2) {
      gridUnit = 2 * x;
    } else if (y === 5) {
      gridUnit = 4 * x;
    }

    this.gridUnit = Number(gridUnit.toFixed(14));

    // console.log('gridUnit', gridUnit);
    this.updateInterval(gridUnit);
    // 保证一直为虚线
    this.material.gapSize = this.gridUnit / 20;
    this.material.dashSize = this.gridUnit / 20;
    this.computeLineDistances();


    const { x: cx, y: cy } = target;
    const dx = cx % this.gridUnit;
    const dy = cy % this.gridUnit;
    const dz = cy % this.gridUnit;
    const pos = new Vector3().subVectors(target, new Vector3(dx, dy, dz));
    this.position.copy(pos);

  }
}

function getY(x) {
  let scaledX = x;
  while (scaledX < 10) {
    scaledX *= 10;
  }

  while (scaledX >= 100) {
    scaledX /= 10;
  }

  let scaledY;
  if (scaledX < 25) {
    scaledY = 5;
  } else if (scaledX < 50) {
    scaledY = 2;
  } else {
    scaledY = 1;
  }

  return {
    y: scaledY,
    x: scaledX / x,
  };
}

function getInterval(camera, dom) {
  const { width, height } = dom.getBoundingClientRect();
  const cpi = camera.projectionMatrixInverse.elements;
  const MP0 = cpi[0];
  const MP5 = cpi[5];
  const [divisionX, divisionY] = [width / MP0 / 2, height / MP5 / 2];
  return {
    x: divisionX,
    y: divisionY,
  };
}

export { DynamicGrid };
