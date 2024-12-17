/*
 * @Date: 2023-07-25 16:53:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-28 15:21:39
 * @FilePath: /threejs-demo/src/material/stencil.js
 */
import {
  Vector3,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  BoxGeometry,
  MeshBasicMaterial,
  ReplaceStencilOp,
  NotEqualStencilFunc,
  PointLight,
} from 'three';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initCustomGrid,
  initOrbitControls,
  initScene
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.setClearColor(0xefefef);

  const camera = initOrthographicCamera(new Vector3(100, 100, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const scene = initScene();
  initCustomGrid(scene);

  scene.add(new AmbientLight());

  const pointLight = new PointLight(0xffffff);
  pointLight.angle = Math.PI / 4;
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  pointLight.shadow.camera.near = 0.1;
  pointLight.shadow.camera.far = 1000;
  pointLight.intensity = 1;
  pointLight.position.set(100, 100, 100);

  // camera.add(spotLight);
  scene.add(pointLight);

  const geometry = new BoxGeometry(2, 2, 2);
  const normalMaterial = new MeshPhongMaterial({
    color: '#00ff00',
    opacity: 1,
    stencilWrite: true,
    stencilRef: 1,
    stencilZPass: ReplaceStencilOp,
  });
  
  const faceMaterial = new MeshBasicMaterial({
    color: 'orange',
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: NotEqualStencilFunc,
  });

  const normalObject = new Mesh(geometry, normalMaterial);
  const faceObject = new Mesh(geometry, faceMaterial);
  faceObject.scale.set(1.1, 1.1, 1.1);

  scene.add(normalObject, faceObject);

  function render() {
    renderer.clear();
    renderer.render(scene, camera);
    orbitControls.update();
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);
}
