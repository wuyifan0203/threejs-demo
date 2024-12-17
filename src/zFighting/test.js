/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 13:51:39
 * @FilePath: /threejs-demo/src/zFighting/test.js
 */
import {
  PerspectiveCamera,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  BoxGeometry,
} from 'three';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { 
  initRenderer, 
  resize,
  initOrbitControls,
  initDirectionLight,
  initScene,
  initStats
 } from '../lib/tools/index.js';
import { FaceNormalsHelper } from '../lib/three/FaceNormalsHelper.js';


window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  
  const stats = initStats();

  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000000);
  camera.up.set(0, 0, 1);
  camera.position.set(5, 5, 5);
  camera.lookAt(10, 0, 0);

  const scene = initScene();

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);
  resize(renderer, camera);

  function render() {
    stats.begin();
    orbitControls.update();
    renderer.clear();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    stats.end();
    requestAnimationFrame(render);
  }
  render();

  const defaultParams = {
    side: DoubleSide,
    transparent: true,
    opacity: 0.5,
    depthTest: false,
    depthWrite: true,
    wireframe: true,
  };

  function addLight(x, y, z) {
    const light = initDirectionLight();
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
