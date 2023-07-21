/*
 * @Date: 2023-05-08 17:17:11
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-05-10 18:17:52
 * @FilePath: /threejs-demo/packages/examples/material/transparentTest2.js
 */
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
  BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector3,
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  getColor,
} from '../../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(30, 30, 50));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const scene = new Scene();

  renderer.setClearColor(0xffffff);

  const orbitControls = new OrbitControls(camera, renderer.domElement);

  const createTransparentMaterial = (index) => new MeshBasicMaterial({
    color: getColor(index),
    transparent: true,
    opacity: 0.4,
    side: 2,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: 0.1,
    polygonOffsetUnits: 0.1,
  });

  const geometry = new BoxGeometry(1, 1, 1);
  geometry.computeVertexNormals();

  const meshList = [];

  const mesh1 = new Mesh(geometry, createTransparentMaterial(10));
  mesh1.scale.set(10, 8, 8);
  mesh1.position.z = 4;
  scene.add(mesh1);
  mesh1.renderOrder = 3;
  meshList.push(mesh1);

  const mesh2 = new Mesh(geometry, createTransparentMaterial(80));
  mesh2.scale.set(9, 7, 4);
  mesh2.position.z = 2;
  scene.add(mesh2);
  mesh2.renderOrder = 2;
  meshList.push(mesh2);

  const mesh3 = new Mesh(geometry, createTransparentMaterial(150));
  mesh3.scale.set(8, 6, 2);
  mesh3.position.z = 1;
  scene.add(mesh3);
  mesh3.renderOrder = 1;
  meshList.push(mesh3);

  resize(renderer, camera);

  renderer.sortObjects = true;

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
