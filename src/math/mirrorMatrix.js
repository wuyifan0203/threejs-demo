import { GLTFLoader } from '../lib/three/GLTFLoader.js';
import {
  Mesh,
  BufferGeometry,
  Vector3,
  BufferAttribute,
  BoxGeometry,
  MeshLambertMaterial,
  Matrix4,
  Euler,
  Quaternion,
  Points,
  PointsMaterial,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initAxesHelper,
  rotationFormula,
  createMirrorMatrix,
  initScene,
  initOrbitControls,
  initSpotLight,
  initAmbientLight,
  initDirectionLight,
  initTransformControls,
  initGUI
} from '../lib/tools/index.js';


window.onload = function () {
  init();
}

async function init() {
  const renderer = initRenderer();

  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = initScene();

  const light = initDirectionLight();
  light.position.set(40, 40, 70);
  scene.add(light);

  const modelLoader = new GLTFLoader();
  const path = '../../public/models/';
  const model = await modelLoader.loadAsync(`${path}rubber_duck_toy/rubber_duck_toy_1k.gltf`);
  const modelMesh = model.scene;
  modelMesh.castShadow = true;
  modelMesh.rotateX(Math.PI / 2);
  modelMesh.scale.set(10, 10, 10)
  scene.add(modelMesh);

  const options = {
    target: modelMesh
  }


  const gui = initGUI();

  initAmbientLight(scene);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  const transformControls = initTransformControls(camera, renderer.domElement);
  function render() {
    controls.update();
    light.position.copy(camera.position);
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);

  gui.add(options, 'target', { modelMesh }).name('Select Target').onChange((e) => {
    
  });
}

