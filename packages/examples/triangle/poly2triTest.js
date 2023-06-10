/*
 * @Date: 2023-06-10 16:00:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-10 18:40:27
 * @FilePath: /threejs-demo/packages/examples/triangle/poly2triTest.js
 */
import { SweepContext, Point } from '../../lib/other/poly2tri.js';

import {
  Mesh, MeshBasicMaterial, Scene, BufferAttribute, Vector3, BufferGeometry,
} from '../../lib/three/three.module.js';
import {
  initCustomGrid, initOrbitControls, initOrthographicCamera, initRenderer,
} from '../../lib/tools/common.js';

const data1 = {
  path: [1, 1, 1, 3, 3, 3, 3, 1],

  holes: [
    2.00, 2.00,
    2.00, 2.50,
    2.50, 2.50,
  ],
};

const contour = [
  new Point(1, 1),
  new Point(1, 3),
  new Point(3, 3),
  new Point(3, 1),
];

const swctx = new SweepContext(contour);

const hole = [
  new Point(2.00, 2.00),
  new Point(2.00, 2.50),
  new Point(2.50, 2.50),
];
swctx.addHole(hole);

swctx.triangulate();

const triangles = swctx.getTriangles();

const array = [];
triangles.forEach((t) => {
  t.getPoints().forEach((p) => {
    array.push(p.x, p.y, 0);
  });
});

console.log(array);

window.onload = () => {
  init();
};

function init() {
  const scene = new Scene();
  const renderer = initRenderer();
  renderer.setClearColor(0xffffff);
  const camera = initOrthographicCamera(new Vector3(0, 0, 1000));
  camera.up.set(0, 0, 1);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const material = new MeshBasicMaterial({ color: '#ff0000', wireframe: true });

  const plane = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(array), 3));

  const mesh = new Mesh(plane, material);

  const grid = initCustomGrid(scene, 500, 500);

  grid.position.set(0, 0, -0.11);

  scene.add(mesh);

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
