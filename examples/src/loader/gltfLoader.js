/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-02-24 12:38:57
 * @FilePath: /threejs-demo/src/examples/loader/gltfLoader.js
 */
import {
  Scene,
  PointLight,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  MeshPhongMaterial,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { GLTFLoader } from '../../lib/three/GLTFLoader.js';
import { initRenderer, resize } from '../../lib/tools/index.js';

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
  camera.lookAt(0, 0, 0);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);

  const light = new PointLight(0xffffff, 2);
  light.position.set(50, 50, 75);

  const light3 = new PointLight(0xffffff, 2);
  light3.position.set(-50, -50, 75);

  const light2 = new DirectionalLight(0xffffff, 1);

  const ambientLight = new AmbientLight(0xffffff, 1);
  scene.add(light, light2, ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene, camera);
  resize(renderer, camera);

  render();
  function render() {
    controls.update();
    renderer.clear();
    renderer.render(scene, camera);
    light2.position.copy(camera.position);
    requestAnimationFrame(render);
  }

  window.camera = camera;
  window.scene = scene;
}

function draw(scene) {
  // model
  const modelPath = '../../resources/models/ar15_rifle/scene.gltf';
  const loader = new GLTFLoader();
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

  loader.load(modelPath, modelOnLoad, null, onError);
}
