/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-13 15:39:15
 * @FilePath: /threejs-demo/src/zFighting/pologyOffsetTest.js
 */
import {
  PerspectiveCamera,
  MeshPhongMaterial,
  Mesh,
  PlaneGeometry,
  Vector3,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  resize,
  initDirectionLight,
  initOrbitControls,
  initGUI,
  initScene,
  initAmbientLight,
  initPerspectiveCamera,
  initStats
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();

  const stats = initStats();


  const camera = initPerspectiveCamera(new Vector3(5, 5, 5));
  camera.up.set(0, 0, 1);

  const scene = initScene();

  const light = initDirectionLight();
  light.position.set(70, 70, 70);
  scene.add(light);


  initAmbientLight(scene);

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  
  resize(renderer, camera);

  function render() {
    stats.begin();
    orbitControls.update();
    renderer.render(scene, camera);
    light.position.copy(camera.position);
    stats.end();
  }

  renderer.setAnimationLoop(render);

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

  const gui = initGUI();

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
