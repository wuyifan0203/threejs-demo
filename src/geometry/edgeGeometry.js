/*
 * @Date: 2024-01-02 14:03:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-02 15:13:11
 * @FilePath: /threejs-demo/src/geometry/edgeGeometry.js
 */
import {
  Vector3,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  BufferGeometry,
  LineSegments,
  LineBasicMaterial,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
  initScene,
  initOrbitControls,
  initGUI
} from '../lib/tools/index.js';
import {
  EdgesGeometry
} from '../lib/three/EdgesGeometry.js'

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);

  const geometryPool = {
    box: new BoxGeometry(4, 4, 4),
    sphere: new SphereGeometry(2, 32, 32),
    cylinder: new CylinderGeometry(2, 2, 4, 32)
  }

  const mesh = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: 0x0000ff }));

  scene.add(mesh);

  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);

  const operation = {
    key: 'box',
    thresholdAngle: 1
  }

  function makeEdge() {
    const geometry = geometryPool[operation.key];
    const edge = new EdgesGeometry(geometry, operation.thresholdAngle);
    mesh.geometry.dispose();
    mesh.geometry = edge;
  }

  makeEdge();

  const gui = initGUI();

  gui.add(operation, 'key', Object.keys(geometryPool)).onChange(makeEdge);
  gui.add(operation, 'thresholdAngle', 0, 180, 1).onChange(makeEdge);
}

