/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-02-01 18:05:24
 * @FilePath: /threejs-demo/src/examples/zFighting/test.js
 */
import {
  Scene,
  PerspectiveCamera,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  PlaneGeometry,
  DirectionalLight,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';
import {
  initRenderer, resize,
} from '../../lib/tools/index.js';
import datGui from '../../lib/util/dat.gui.js';

import { Stats } from '../../lib/util/Stats.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();

  const stats = new Stats();
  stats.showPanel(0);
  document.getElementById('webgl-output').append(stats.dom);
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000000);
  camera.up.set(0, 0, 1);
  camera.position.set(5, 5, 5);
  camera.lookAt(10, 0, 0);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);
  resize(renderer, camera);

  function render() {
    stats.begin();
    orbitControls.update();
    requestAnimationFrame(render);
    renderer.clear();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    stats.end();
  }
  render();
  window.camera = camera;
  window.scene = scene;

  const defaultParams = {
    side: DoubleSide,
    transparent: true,
    opacity: 0.5,
    // depthTest: false,
    // depthWrite: false,
  };

  function addLight(x, y, z) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    scene.add(light);
  }
  addLight(-1, 2, 4);
  addLight(1, -1, -2);

  const createMaterial = (color) => new MeshPhongMaterial({ ...defaultParams, color });
  const plane = new PlaneGeometry(2, 2);

  const meshes = {
    planeMesh1: new Mesh(plane, createMaterial('red')),
    planeMesh2: new Mesh(plane, createMaterial('yellow')),
    planeMesh3: new Mesh(plane, createMaterial('blue')),
    planeMesh4: new Mesh(plane, createMaterial('green')),
  };

  scene.add(
    meshes.planeMesh1,
    meshes.planeMesh2,
    // meshes.planeMesh3,
    // meshes.planeMesh4,
  );
  const queen = () => {
    let i = -2;
    for (const key in meshes) {
      const mesh = meshes[key];
      console.log(mesh);
      mesh.rotation.set(0, 0, 0);
      mesh.position.set(i, i, i);
      i++;
    }
  };

  const union = () => {
    let i = 0;
    for (const key in meshes) {
      const mesh = meshes[key];
      console.log(mesh);
      mesh.rotation.set(i * 40, 0, 0);
      mesh.position.set(0, 0, 0);
      i++;
    }
  };

  union();

  const gui = new datGui.GUI();
}
