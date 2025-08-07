/*
 * @Date: 2023-05-08 17:17:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-12 18:05:23
 * @FilePath: /threejs-demo/src/material/clipping.js
 */
import {
  Vector3,
  TorusKnotGeometry,
  MeshPhongMaterial,
  Mesh,
  Plane,
  PlaneHelper,
  Clock,
} from 'three';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initGroundPlane,
  initOrbitControls,
  initScene,
  initGUI,
  initDirectionLight,
  initAmbientLight
} from '../lib/tools/index.js';


window.onload = () => {
  init();
};

function init() {
  const camera = initOrthographicCamera(new Vector3(-60, 113, 120));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.4;
  camera.updateProjectionMatrix();

  const scene = initScene();
  initGroundPlane(scene);
  initAmbientLight(scene);


  const light = initDirectionLight(0xffffff,5);
  light.position.set(40, 40, 80);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 200;
  light.shadow.camera.left = -50;
  light.shadow.camera.right = 50;
  light.shadow.camera.top = 50;
  light.shadow.camera.bottom = -50;
  scene.add(light);

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

  const gui = initGUI();

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
