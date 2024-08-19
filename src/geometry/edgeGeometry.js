/*
 * @Date: 2024-01-02 14:03:01
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-08-19 15:50:03
 * @FilePath: /threejs-demo/src/geometry/edgeGeometry.js
 */
import {
  Vector3,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  BufferGeometry,
  Mesh,
  LineBasicMaterial,
  InstancedMesh,
  MeshNormalMaterial,
  BufferAttribute,
  Matrix4,
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

const controls = {
  key: 'box',
}

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

  const orbit = initOrbitControls(camera, renderer.domElement);

  const geometryPool = {
    box: new BoxGeometry(10, 6, 8, 10, 10, 10).toNonIndexed(),
    sphere: new SphereGeometry(8, 32, 32).toNonIndexed(),
    cylinder: new CylinderGeometry(2, 2, 4, 32).toNonIndexed()
  }

  const mesh = new Mesh(geometryPool[controls.key], new MeshNormalMaterial({ wireframe: true }));

  scene.add(mesh);

  (function render() {
    renderer.clear();
    orbit.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  })();

  const pointGeometry = new SphereGeometry(0.1, 8, 8);
  const instanceMaterial = new MeshNormalMaterial({ wireframe: true });

  let instanceMesh = new InstancedMesh(pointGeometry, instanceMaterial, 0);
  scene.add(instanceMesh);

  const tmpV = new Vector3();
  const tmpM = new Matrix4();
  const updateInstanceMesh = () => {
    const countSet = new Set();
    const position = mesh.geometry.attributes.position;
    for (let i = 0, l = position.count; i < l; i++) {
      tmpV.fromArray(position.array, i * 3);
      countSet.add(tmpV.toArray().join(','));
    }
    console.log(countSet.size);

    instanceMesh.dispose();
    instanceMesh = new InstancedMesh(pointGeometry, instanceMaterial, countSet.size);
    for (let i = 0, l = countSet.size; i < array.length; i++) {
      instanceMesh.setMatrixAt(i, tmpM.makeTranslation());

    }

  };

  updateInstanceMesh()

  const gui = initGUI();

  gui.add(controls, 'key', Object.keys(geometryPool)).onChange();
}

