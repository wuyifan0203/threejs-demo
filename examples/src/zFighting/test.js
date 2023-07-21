/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-02-10 14:34:32
 * @FilePath: /threejs-demo/src/examples/zFighting/test.js
 */
import {
  Scene,
  PerspectiveCamera,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  DirectionalLight,
  BoxGeometry,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';
import { initRenderer, resize } from '../../lib/tools/index.js';
import { FaceNormalsHelper } from '../../lib/three/FaceNormalsHelper.js';

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
    depthTest: false,
    depthWrite: true,
    wireframe: true,
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

  // scene.add(
  // meshes.planeMesh1,
  // meshes.planeMesh2,
  // meshes.planeMesh3,
  // meshes.planeMesh4,
  // );

  const boxMesh = new Mesh(new BoxGeometry(3, 3, 3), createMaterial('yellow'));

  scene.add(boxMesh);
  console.log(boxMesh);
  boxMesh.geometry.computeVertexNormals();
  const fn = new FaceNormalsHelper(boxMesh, 1);
  scene.add(fn);
}
