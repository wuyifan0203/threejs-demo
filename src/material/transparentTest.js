/*
 * @Date: 2023-05-08 17:17:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 17:09:39
 * @FilePath: /threejs-demo/src/material/transparentTest.js
 */
import {
  AmbientLight,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PointLight,
  Vector3,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initScene,
  initOrbitControls,
  initDirectionLight
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
  const light = initDirectionLight();
  camera.add(light)
  scene.add(camera);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const transparentMaterial = new MeshStandardMaterial({
    color: 'white',
    transparent: true,
    opacity: 0.3,
    depthTest: true,
    side:2
  });

  const commonMaterial = new MeshStandardMaterial({
    color: 'green',
  });

  const lineMaterial = new LineBasicMaterial({ color: 'black', side: 2 });

  const geometry = new BoxGeometry(10, 10, 10);

  const mesh = new Mesh(geometry, commonMaterial);
  mesh.scale.set(0.5, 1.2, 0.3);
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
