/*
 * @Date: 2023-09-06 10:24:49
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-07 21:01:39
 * @FilePath: /threejs-demo/apps/cube/index.js
 */
/* eslint-disable no-unused-vars */
/*
 * @Date: 2023-01-05 17:20:07
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-05-30 20:23:54
 * @FilePath: /threejs-demo/packages/app/cube/index.js
 */
import {
  Vector3,
  Scene,
  BoxBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  MeshBasicMaterial,
  Group,
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
} from '../../lib/tools/index.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { Cube } from './cube.js';

(function () {
  init();
}());

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(10, 10, 10));
  camera.up.set(0, 0, 1);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

  initAxesHelper(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function draw(scene) {
  const level = 3;
  const size = 2;
  const cube = new Cube(level, size, 0.2);

  scene.add(cube);
  console.log(scene);
}
