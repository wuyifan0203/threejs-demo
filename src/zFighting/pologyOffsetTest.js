/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-19 10:08:15
 * @FilePath: /threejs-demo/src/zFighting/pologyOffsetTest.js
 */
import {
  Scene,
  PerspectiveCamera,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  DirectionalLight,
  PlaneGeometry,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import { initRenderer, resize } from '../lib/tools/index.js';
import { GUI } from '../lib/util/lil-gui.module.min.js';

import { Stats } from '../lib/util/Stats.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const stats = new Stats();
  stats.showPanel(0);
  document.getElementById('webgl-output').append(stats.dom);
  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    100000,
  );
  camera.up.set(0, 0, 1);
  camera.position.set(5, 5, 5);
  renderer.setClearColor(0xffffff);

  const light = new DirectionalLight(0xffffff, 1);

  const scene = new Scene();
  const ambientLight = new AmbientLight(0xffffff);
  scene.add(ambientLight, light);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  resize(renderer, camera);

  function render() {
    stats.begin();
    orbitControls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    light.position.copy(camera.position);
    stats.end();
  }
  render();
  window.camera = camera;
  window.scene = scene;
  const redMaterial = new MeshPhongMaterial({ color: 'red', polygonOffset: true });
  const blueMaterial = new MeshPhongMaterial({ color: 'blue', polygonOffset: true });
  const yellowMaterial = new MeshPhongMaterial({ color: 'yellow', polygonOffset: true });

  const plane = new PlaneGeometry(1, 1);

  const mesh = new Mesh(plane, redMaterial);
  mesh.scale.set(10, 10, 1);
  scene.add(mesh);

  const mesh2 = new Mesh(plane, blueMaterial);
  mesh2.scale.set(4, 4, 1);
  scene.add(mesh2);

  const mesh3 = new Mesh(plane, yellowMaterial);
  mesh3.scale.set(2, 2, 1);
  scene.add(mesh3);

  const gui = new GUI();

  const material = {
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 0.4,
    shininess: 0,
    transparent: false,
    depthTest: true,
    depthWrite: true,
    opacity: 1,
  };

  const redFolder = gui.addFolder('Red');
  redFolder.add(redMaterial, 'polygonOffset').onChange(() => redMaterial.needsUpdate = true);
  redFolder.add(redMaterial, 'polygonOffsetFactor', -100, 100, 0.1).onChange(() => redMaterial.needsUpdate = true);
  redFolder.add(redMaterial, 'polygonOffsetUnits', -100, 100, 0.1).onChange(() => redMaterial.needsUpdate = true);
  redFolder.add(redMaterial, 'depthTest').onChange(() => redMaterial.needsUpdate = true);

  const blueFolder = gui.addFolder('Blue');
  blueFolder.add(blueMaterial, 'polygonOffset').onChange(() => blueMaterial.needsUpdate = true);
  blueFolder.add(blueMaterial, 'polygonOffsetFactor', -100, 100, 0.1).onChange(() => blueMaterial.needsUpdate = true);
  blueFolder.add(blueMaterial, 'polygonOffsetUnits', -100, 100, 0.1).onChange(() => blueMaterial.needsUpdate = true);
  blueFolder.add(blueMaterial, 'depthTest').onChange(() => blueMaterial.needsUpdate = true);

  const yellowFolder = gui.addFolder('Yellow');
  yellowFolder.add(yellowMaterial, 'polygonOffset').onChange(() => yellowMaterial.needsUpdate = true);
  yellowFolder.add(yellowMaterial, 'polygonOffsetFactor', -100, 100, 0.1).onChange(() => yellowMaterial.needsUpdate = true);
  yellowFolder.add(yellowMaterial, 'polygonOffsetUnits', -100, 100, 0.1).onChange(() => yellowMaterial.needsUpdate = true);
  yellowFolder.add(yellowMaterial, 'depthTest').onChange(() => yellowMaterial.needsUpdate = true);

}
