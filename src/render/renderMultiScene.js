/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-26 16:46:30
 * @FilePath: /threejs-demo/src/render/renderMultiScene.js
 */
import {
  Scene,
  Mesh,
  Vector3,
  AmbientLight,
  BoxGeometry,
  MeshStandardMaterial,
  Clock,
  GridHelper,
  Vector2,
  TextureLoader
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';

import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initGroundPlane,
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const loader= new TextureLoader()
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  renderer.shadowMap.enabled = true;
  renderer.setAnimationLoop(animate);
  renderer.setClearColor(0xfffee);
  renderer.autoClear = false;


  const camera = initOrthographicCamera(new Vector3(-1000, 1000, 1000));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const scene1 = initScene();

  const light = initDirectionLight();
  light.position.set(20, 20, 20);
  light.target = scene1;

  scene1.background = loader.load("../../public/images/sky2/nx.png")

  scene1.add(light);
  scene1.add(new AmbientLight());

  initGroundPlane(scene1, new Vector2(20, 20));

  const orbitControl = new OrbitControls(camera, renderer.domElement);

  const mesh = new Mesh(new BoxGeometry(5, 4, 3), new MeshStandardMaterial({ color: 0x049ef4, roughness: 0 }));
  mesh.position.set(0, 0, 6);
  mesh.castShadow = true;
  scene1.add(mesh);

  const scene2 = initScene();
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
