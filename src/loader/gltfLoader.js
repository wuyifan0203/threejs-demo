/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 14:41:57
 * @FilePath: /threejs-demo/src/loader/gltfLoader.js
 */
import {
  PointLight,
  PerspectiveCamera,
  MeshPhongMaterial,
} from 'three';
import {
  initAmbientLight,
  initDirectionLight,
  initRenderer,
  resize,
  initScene,
  initOrbitControls,
  initLoader,
  Model_Path
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000,
  );
  camera.position.set(-43, 13, 0.6);
  camera.zoom = 0.2;
  camera.lookAt(0, 0, 0);

  const scene = initScene();
  renderer.setClearColor(0xffffff);

  const light = new PointLight(0xffffff, 3, 0, 0);
  light.position.set(50, 50, 75);

  const light3 = new PointLight(0xffffff, 2, 0, 0);
  light3.position.set(-50, -50, 75);

  const light2 = initDirectionLight();

  initAmbientLight(scene)
  scene.add(light, light2);

  const controls = initOrbitControls(camera, renderer.domElement);
  resize(renderer, camera);

  function render() {
    controls.update();
    renderer.clear();
    renderer.render(scene, camera);
    light2.position.copy(camera.position);
    requestAnimationFrame(render);
  }
  render();


  const loader = initLoader();
  let modelMesh = null;

  const modelOnLoad = (mesh) => {
    modelMesh = mesh.scene;
    modelMesh.material = new MeshPhongMaterial({
      color: '#ffe8a3',
      depthTest: true,
    });
    modelMesh.scale.set(20, 20, 20);
    scene.add(modelMesh);
  };
  const onError = (e) => {
    console.error('load model fail !', e.stack);
  };

  loader.load(`../../${Model_Path}/ar15_rifle/scene.gltf`, modelOnLoad, null, onError);
}
