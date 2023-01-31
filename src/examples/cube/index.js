/* eslint-disable no-unused-vars */
/*
 * @Date: 2023-01-05 17:20:07
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-31 17:33:13
 * @FilePath: /threejs-demo/src/examples/cube/index.js
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
  createAxesHelper,
  initCustomGrid,
} from '../../lib/tools/index.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { Cube } from './cube.js';

(function () {
  init();
}());

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

  createAxesHelper(scene);

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
  const cube = new Cube(level, size, 0);

  scene.add(cube);
  console.log(scene);
}
