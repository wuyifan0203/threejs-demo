/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 11:00:55
 * @FilePath: /threejs-demo/src/render/renderMultiScene.js
 */
import {
  Mesh,
  Vector3,
  BoxGeometry,
  MeshStandardMaterial,
  Clock,
  GridHelper,
  Vector2,
  TextureLoader
} from '../lib/three/three.module.js';

import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initScene,
  initOrbitControls,
  initGroundPlane,
  initAmbientLight,
  initDirectionLight
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const loader= new TextureLoader()
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  renderer.shadowMap.enabled = true;
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
  initAmbientLight(scene1);

  initGroundPlane(scene1, new Vector2(20, 20));

  const orbitControl = initOrbitControls(camera, renderer.domElement);

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

  function update() {
    renderer.clear();
    orbitControl.update();
    renderer.render(scene1, camera);
    renderer.render(scene2, camera);
  }

  function render() {
    const time = clock.getElapsedTime();
    mesh.rotation.x = time * 2;
    mesh.rotation.y = time * 2;
    grid.rotation.z = time * 3;
    needUpdate = true;

    if (needUpdate) {
      update();
    }
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);
}
