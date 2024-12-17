/*
 * @Date: 2023-06-15 16:51:49
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 17:02:28
 * @FilePath: /threejs-demo/src/line/pathPreview.js
 */
import {
  Vector3,
  LineBasicMaterial,
  BufferGeometry,
  BufferAttribute,
  LineLoop,
  Points,
  PointsMaterial,
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
  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  camera.up.set(0, 0, 1);
  const scene = initScene();
  initAxesHelper(scene);
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  draw(scene);

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);

}

function draw(scene) {
  const data = [
    [0.39500, -0.41500],
    [0.03000, -0.05000],
    [-0.44000, -0.05000],
    [-0.44000, 0.43500],
    [0.38500, 0.43500],
    [0.40500, 0.38500],
    [0.22000, 0.20000],
    [0.41000, 0.01000],
    [0.74000, 0.34000],
    [0.74000, 0.65000],
    [-0.39000, 0.65000],
    [-0.39000, 0.75000],
    [0.84000, 0.75000],
    [0.84000, 0.30000],
    [0.41000, -0.13000],
    [0.08000, 0.20000],
    [0.21500, 0.33500],
    [-0.34000, 0.33500],
    [-0.34000, 0.05000],
    [0.07000, 0.05000],
    [0.39500, -0.27500],
    [0.94000, 0.27000],
    [0.94000, 0.78000],
    [-0.42000, 0.78000],
    [-0.42000, 0.58000],
    [0.63000, 0.58000],
    [0.63000, 0.37000],
    [0.45000, 0.19000],
    [0.45000, 0.19000],
    [0.38000, 0.12000],
    [0.31000, 0.19000],
    [0.53000, 0.41000],
    [0.53000, 0.48000],
    [-0.52000, 0.48000],
    [-0.52000, 0.88000],
    [1.04000, 0.88000],
    [1.04000, 0.23000],
  ];

  const LM1 = new LineBasicMaterial({ color: 'green' });

  const gM1 = new PointsMaterial({ size: 7, vertexColors: true });

  const g1 = useVec2Array(data, 1);

  const rl = new LineLoop(g1, LM1);

  const rP = new Points(g1, gM1);

  scene.add(rl, rP);
}

function useVec2Array(data, height) {
  const vertex = [];
  const color = [];
  const b = 1 / data.length;
  for (let i = 0; i < data.length; i++) {
    const [x, y] = data[i];
    vertex.push(x, y, height);
    const r = b * i;
    if (i === 0) {
      color.push(1, 0, 0);
    } else if (i === data.length - 1) {
      color.push(0, 0, 1);
    } else {
      color.push(r, r, r);
    }
  }

  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(vertex), 3));
  g.setAttribute('color', new BufferAttribute(new Float32Array(color), 3));
  return g;
}
