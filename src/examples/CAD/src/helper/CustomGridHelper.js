
import {
  LineSegments,
  LineBasicMaterial,
  Float32BufferAttribute,
  BufferGeometry,
  Color
} from '../lib/three.module.js';

class CustomGridHelper extends LineSegments {
  constructor(width = 10, height = 10, divsion = 1, splice = 1, centerColor = 0xaaaaaa, baseColor = 0xdfdfdf, divsionColor = 0xeeeeee) {
    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({ vertexColors: true, toneMapped: false });
    super(geometry, material);
    this.type = 'CustomGridHelper';
    this.centerColor = new Color(centerColor);
    this.baseColor = new Color(baseColor);
    this.divsionColor = new Color(divsionColor);

    this.width = width;
    this.height = height;
    this.divsion = divsion;
    this.splice = splice;

    this.update()
  }

  update() {
    let delta;
    if (this.splice === 1) {
      delta = 1;
    } else {
      delta = 1 / this.splice;
    }

    const { centerColor, baseColor, divsionColor, width, height, splice, divsion } = this
    const [timesX, timesY] = [width / divsion * splice, height / divsion * splice];

    const vertices = [];
    const colors = [];
    let color, j10, isCenter,c =0;

    function loop(half, center, times, delta, axis) {
      const o = {};
      o.x = (k, half) => vertices.push(-half, k, 0, half, k, 0);
      o.y = (k, half) => vertices.push(k, -half, 0, k, half, 0);
      for (let j = 0, k = -half; j <= times; j++, k += delta) {
        o[axis](k, half)
        j10 = j % splice === 0;
        isCenter = j === center;
        
        color = divsionColor;
        if (isCenter) {
          color = centerColor;
        } else {
          if (j10 && !isCenter) {
            color = baseColor;
          }
        }

        color.toArray(colors, c); c += 3;
        color.toArray(colors, c); c += 3;
      }

    }

    loop(width/2, timesX / 2, timesX, delta, 'x');
    loop(height/2, timesY / 2, timesY, delta, 'y');

    this.geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    this.geometry.attributes.position.needUpdate = true;
    this.geometry.attributes.color.needUpdate = true;
  }

  dispose(){
    this.geometry.dispose();
    this.material.dispose();
  }
}

export { CustomGridHelper };
