/* eslint-disable no-param-reassign */
/*
 * @Date: 2023-01-30 14:03:05
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-07 10:11:23
 * @FilePath: /threejs-demo/packages/examples/light/shadow.js
 */
/* eslint-disable no-unused-vars */
import { GUI } from '../lib/util/lil-gui.module.min.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initGroundPlane,
  resize,
} from '../lib/tools/index.js';
import {
  Scene,
  Vector3,
  Mesh,
  MeshLambertMaterial,
  SpotLight,
  AmbientLight,
  SpotLightHelper,
  BoxGeometry,
  Color,
} from '../lib/three/three.module.js';

let stop = false;

const init = () => {
  const renderer = initRenderer();
  // 1
  renderer.shadowMap.enabled = true;
  const camera = initPerspectiveCamera(new Vector3(20, 20, 20));
  camera.up.set(0, 0, 1);

  const scene = initScene();
  initAxesHelper(scene);
  const ambientLight = new AmbientLight(0x3c3c3c);
  scene.add(ambientLight);

  const spotLight = new SpotLight(0xffffff, 1, 180, 0.5);
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.position.set(-40, 30, 30);
  spotLight.castShadow = true;
  scene.add(spotLight);
  const spotLightHelper = new SpotLightHelper(spotLight);
  scene.add(spotLightHelper);

  const groundPlane = initGroundPlane(scene);
  groundPlane.position.set(0, 0, 0);
  groundPlane.rotation.z = -0.5 * Math.PI;
  // 2
  groundPlane.receiveShadow = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene, spotLight, spotLightHelper);
  resize(renderer, camera);

  function render() {
    controls.update();
    if (!stop) {
      spotLight.position.copy(camera.position);
      spotLightHelper.update();
    }
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
  render();

  window.camera = camera;
  window.scene = scene;
};

function draw(scene, light, helper) {
  const material = new MeshLambertMaterial({ color: '#016050' });

  const mesh = new Mesh(new BoxGeometry(5, 5, 5), material);
  mesh.position.set(0, 5, 3);
  mesh.name = 'box';
  mesh.receiveShadow = true;
  // 3
  mesh.castShadow = true;
  mesh.renderOrder = 1;
  scene.add(mesh);

  const mesh2 = new Mesh(new BoxGeometry(1, 1, 1), material);
  mesh2.position.set(5, 5, 3);
  mesh2.name = 'box2';
  // 4
  mesh2.receiveShadow = true;

  mesh2.castShadow = true;
  mesh2.renderOrder = 2;
  scene.add(mesh2);

  const gui = new GUI();

  light.target = mesh;

  const controls = {
    color: light.color,
    stop,
  };

  const updateHelper = (e) => helper.update();

  gui.addColor(controls, 'color').onChange((e) => {
    light.color = new Color(e.r, e.g, e.b);
  });
  gui.add(light, 'decay', 0, 15.01);
  gui.add(light, 'angle', 0, Math.PI * 2).onChange(updateHelper);
  gui.add(light, 'intensity', 0, 5).onChange(updateHelper);
  gui.add(light, 'penumbra', 0, 1).onChange(updateHelper);
  gui.add(light, 'distance', 0, 200).onChange(updateHelper);
  gui.add(light, 'castShadow');

  gui.add(light, 'target', ['mesh', 'mesh2']).onChange((e) => {
    light.target = e === 'mesh' ? mesh : mesh2;
    updateHelper();
  });

  gui.add(helper, 'visible').name('show helper');

  gui.add(controls, 'stop').onChange((e) => {
    stop = e;
  });
}

window.onload = () => {
  init();
};
