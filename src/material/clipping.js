/*
 * @Date: 2023-05-08 17:17:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-10 15:13:07
 * @FilePath: /threejs-demo/packages/examples/material/clipping.js
 */
import {
  Scene,
  Vector3,
  TorusKnotGeometry,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  SpotLight,
  Plane,
  PlaneHelper,
  Clock,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initGroundPlane,
  initOrbitControls
} from '../lib/tools/index.js';

import { GUI } from '../lib/util/lil-gui.module.min.js';

window.onload = () => {
  init();
};

function init() {
  const camera = initOrthographicCamera(new Vector3(-60, 113, 120));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.4;
  camera.updateProjectionMatrix();

  const scene = new Scene();
  initGroundPlane(scene);

  scene.add(new AmbientLight());

  const spotLight = new SpotLight(0xffffff);
  spotLight.angle = Math.PI / 4;
  spotLight.position.set(40, 40, 80);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.near = 0.1;
  spotLight.shadow.camera.far = 1000;
  spotLight.intensity = 0.8;

  scene.add(spotLight);

  const localPlane = new Plane(new Vector3(0, 0, -1), 18);
  const planeHelper1 = new PlaneHelper(localPlane, 50);
  scene.add(planeHelper1);

  const globalPlane = new Plane(new Vector3(-1, 0, 0), 5);
  const planeHelper2 = new PlaneHelper(globalPlane, 50, 0xff0000);
  scene.add(planeHelper2);

  const renderer = initRenderer();
  renderer.setClearColor(0x000000);
  renderer.shadowMap.enabled = true;
  renderer.localClippingEnabled = true;
  renderer.clippingPlanes = [globalPlane];

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const geometry = new TorusKnotGeometry(8, 2, 100, 36);

  const material = new MeshPhongMaterial({
    side: 2,
    color: 0x80ee10,
    shininess: 100,
    clipShadows: true,
    clippingPlanes: [localPlane],
  });

  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.position.z = 15;

  scene.add(mesh);

  const clock = new Clock();

  function render() {
    const time = clock.getElapsedTime();
    mesh.rotation.x = time * 0.2;
    mesh.rotation.y = time * 0.2;
    mesh.rotation.z = time * 0.2;
    orbitControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  resize(renderer, camera);

  const control = { useGlobalClipping: true };

  const gui = new GUI();

  gui.add(renderer, 'localClippingEnabled');
  const localPlaneFolder = gui.addFolder('Local Plane');
  localPlaneFolder.add(renderer, 'localClippingEnabled').name('Use local clipping');
  localPlaneFolder.add(planeHelper1, 'visible').name('Helper visible');
  localPlaneFolder.add(localPlane, 'constant', 0, 30, 0.1);
  localPlaneFolder.add(localPlane.normal, 'x', -1, 1, 0.1);
  localPlaneFolder.add(localPlane.normal, 'y', -1, 1, 0.1);
  localPlaneFolder.add(localPlane.normal, 'z', -1, 1, 0.1);

  const globalPlaneFolder = gui.addFolder('Global Plane');
  globalPlaneFolder.add(control, 'useGlobalClipping').name('Use global clipping').onChange((e) => {
    renderer.clippingPlanes = e ? [globalPlane] : [];
  });
  globalPlaneFolder.add(planeHelper2, 'visible').name('Helper visible');
  globalPlaneFolder.add(globalPlane, 'constant', 0, 30, 0.1);
  globalPlaneFolder.add(globalPlane.normal, 'x', -1, 1, 0.1);
  globalPlaneFolder.add(globalPlane.normal, 'y', -1, 1, 0.1);
  globalPlaneFolder.add(globalPlane.normal, 'z', -1, 1, 0.1);
  /// 注意法向量应该归一化，但是这里没有

  window.scene = scene;
  window.camera = camera;
}
