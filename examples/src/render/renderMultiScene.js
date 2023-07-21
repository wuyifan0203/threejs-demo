/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-10 18:08:05
 * @FilePath: /threejs-demo/packages/examples/render/renderMultiScene.js
 */
import {
  Scene,
  Mesh,
  Vector3,
  AmbientLight,
  DirectionalLight,
  BoxGeometry,
  MeshStandardMaterial,
  Clock,
  GridHelper,
  Vector2,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';

import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initGroundPlane,
} from '../../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  renderer.shadowMap.enabled = true;
  renderer.setAnimationLoop(animate);
  renderer.setClearColor(0xfffee);
  renderer.autoClear = false;

  const camera = initOrthographicCamera(new Vector3(-1000, 1000, 1000));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const scene1 = new Scene();

  const light = new DirectionalLight();
  light.castShadow = true;
  light.shadow.mapSize.height = 2048;
  light.shadow.mapSize.width = 2048;
  light.shadow.camera.near = 1; // default
  light.shadow.camera.far = 10000; // default
  light.position.set(20, 20, 20);
  light.target = scene1;

  scene1.add(light);
  scene1.add(new AmbientLight());

  initGroundPlane(scene1, new Vector2(20, 20));

  const orbitControl = new OrbitControls(camera, renderer.domElement);

  const mesh = new Mesh(new BoxGeometry(5, 4, 3), new MeshStandardMaterial({ color: 0x049ef4, roughness: 0 }));
  mesh.position.set(0, 0, 6);
  mesh.castShadow = true;
  scene1.add(mesh);

  const scene2 = new Scene();
  const grid = new GridHelper(10, 10);
  grid.castShadow = true;
  scene2.add(grid);

  const clock = new Clock();

  let needUpdate = false;

  function render() {
    renderer.clear();
    orbitControl.update();
    renderer.render(scene1, camera);
    renderer.render(scene2, camera);
  }

  function animate() {
    const time = clock.getElapsedTime();
    mesh.rotation.x = time * 2;
    mesh.rotation.y = time * 2;
    grid.rotation.z = time * 3;
    needUpdate = true;

    if (needUpdate) {
      render();
    }
  }

  resize(renderer, camera);
}
