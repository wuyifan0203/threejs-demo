/*
 * @Date: 2023-06-15 16:51:49
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 17:03:23
 * @FilePath: /threejs-demo/src/line/shape.js
 */
import {
  Vector3,
  Vector2,
  Shape,
  LineCurve,
} from 'three';
import {
  initRenderer,
  initOrthographicCamera,
  initAxesHelper,
  initCustomGrid,
  initScene,
  initOrbitControls,
  resize
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.setAnimationLoop(render);
  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  camera.up.set(0, 0, 1);
  const scene = initScene();
  initAxesHelper(scene);
  initCustomGrid(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);

  const x = 4 / 2;
  const y = 4 / 2;
  const shape = new Shape().setFromPoints([
    new Vector2(-x, y),
    new Vector2(-x, -y),
    new Vector2(x, -y),
    new Vector2(x, y)]);

  shape.extractPoints(1);

  console.log(extractPoints(shape, 2));

  function extractPoints(shape, resolution) {
    const points = [];
    let last;

    const { curves } = shape;

    const lastV = curves[curves.length - 1].v2;
    const firstV = curves[0].v1;
    curves.push(new LineCurve(lastV, firstV));

    for (let i = 0; i < curves.length; i++) {
      const curve = curves[i];
      const pts = curve.getPoints(resolution);

      for (let j = 0; j < pts.length; j++) {
        const point = pts[j];

        if (last && last.equals(point)) continue;

        points.push(point);
        last = point;
      }
    }

    curves.length--;

    if (points.length > 1 && points[points.length - 1].equals(points[0])) {
      points.length--;
    }

    return points;
  }
}
