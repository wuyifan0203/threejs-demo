/*
 * @Date: 2023-05-08 17:17:11
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-05-08 18:21:33
 * @FilePath: /threejs-demo/packages/examples/material/transparentTest.js
 */
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  AmbientLight,
  BoxGeometry, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshLambertMaterial, PointLight, Scene, Vector3,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  const camera = initOrthographicCamera(new Vector3(10, 10, 10));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const scene = initScene();
  scene.add(new AmbientLight());
  camera.add(new PointLight());
  scene.add(camera);

  renderer.setClearColor(0xffffff);

  const orbitControls = new OrbitControls(camera, renderer.domElement);

  const transparentMaterial = new MeshLambertMaterial({
    color: 'blue',
    transparent: true,
    opacity: 0.1,
    depthTest: true,
  });

  const commonMaterial = new MeshLambertMaterial({
    color: 'green',
  });

  const lineMaterial = new LineBasicMaterial({ color: 'black', side: 2 });

  const geometry = new BoxGeometry(10, 10, 10);

  const mesh = new Mesh(geometry, commonMaterial);
  mesh.scale.set(0.5, 0.2, 0.3);
  const mesh1 = new Mesh(geometry, transparentMaterial);
  mesh1.add(new LineSegments(new EdgesGeometry(geometry), lineMaterial));

  scene.add(mesh);
  scene.add(mesh1);

  resize(renderer, camera);

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
