/*
 * @Date: 2024-01-02 14:03:01
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-08-21 11:22:06
 * @FilePath: /threejs-demo/src/geometry/edgeGeometry.js
 */
import {
  Vector3,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  FogExp2,
  Mesh,
  LineBasicMaterial,
  InstancedMesh,
  MeshNormalMaterial,
  BufferAttribute,
  Matrix4,
  Vector2,
  Raycaster,
  MeshBasicMaterial,
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
import { TransformControls } from '../lib/three/TransformControls.js';

window.onload = () => {
  init();
};

const geometryPool = {
  box: new BoxGeometry(10, 6, 8, 3, 3, 3).toNonIndexed(),
  sphere: new SphereGeometry(8, 16, 16).toNonIndexed(),
  cylinder: new CylinderGeometry(4, 4, 4, 16).toNonIndexed()
}

const tmpV2 = new Vector2();
const tmpV = new Vector3();
const tmpM = new Matrix4();
const mouse = new Vector2();

const gui = initGUI();

const controls = {
  key: 'cylinder',
  wireframe: true
}

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene, 100, 100);
  initAxesHelper(scene);

  const orbit = initOrbitControls(camera, renderer.domElement);
  orbit.update();
  orbit.addEventListener('change', render);

  scene.fog = new FogExp2(0xffffff, 0.015);


  const mesh = new Mesh(geometryPool[controls.key], new MeshNormalMaterial({ wireframe: true }));
  scene.add(mesh);

  function render() {
    renderer.render(scene, camera);
  }

  const pointGeometry = new SphereGeometry(0.3, 8, 8);
  const instanceMaterial = new MeshNormalMaterial();

  let instanceMesh = new InstancedMesh(pointGeometry, instanceMaterial, 0);
  scene.add(instanceMesh);

  const selectPoints = new Mesh(pointGeometry, new MeshBasicMaterial({ color: 0xff0000 }));
  selectPoints.visible = false;
  scene.add(selectPoints);

  const updateInstanceMesh = () => {
    const countSet = new Set();
    const position = mesh.geometry.attributes.position;
    for (let i = 0, l = position.count; i < l; i++) {
      tmpV.fromArray(position.array, i * 3);
      countSet.add(tmpV.toArray().join(','));
    }

    scene.remove(instanceMesh);
    instanceMesh.dispose();
    instanceMesh = new InstancedMesh(pointGeometry, instanceMaterial, countSet.size);
    instanceMesh.visible = controls.wireframe;
    const vertexArray = Array.from(countSet);
    for (let i = 0, l = countSet.size; i < l; i++) {
      const vertex = vertexArray[i].split(',');
      instanceMesh.setMatrixAt(i, tmpM.makeTranslation(vertex[0], vertex[1], vertex[2]));
    }
    scene.add(instanceMesh);
  };

  const transformControls = new TransformControls(camera, renderer.domElement);
  scene.add(transformControls);

  transformControls.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value;
  })
  transformControls.addEventListener('change', render);
  const origin = new Vector3();
  transformControls.addEventListener('mouseUp', () => {
    tmpV.copy(selectPoints.position);
    const buffer = mesh.geometry.attributes.position;
    for (let i = 0, l = mesh.geometry.attributes.position.count; i < l; i++) {
      currentPos.fromBufferAttribute(buffer, i);
      if (isEqual(currentPos, origin)) {
        buffer.setXYZ(i, tmpV.x, tmpV.y, tmpV.z);
      }
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    instanceMesh.setMatrixAt(selectId, tmpM.makeTranslation(tmpV.x, tmpV.y, tmpV.z));
    instanceMesh.instanceMatrix.needsUpdate = true;
  })
  const currentPos = new Vector3();
  transformControls.addEventListener('mouseDown', () => {
    origin.copy(selectPoints.position);
  });

  const raycaster = new Raycaster();
  let selectId = null;

  renderer.domElement.addEventListener('dblclick', (evt) => {
    renderer.getSize(tmpV2);
    mouse.x = (evt.clientX / tmpV2.x) * 2 - 1;
    mouse.y = -(evt.clientY / tmpV2.y) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([instanceMesh].filter(m => m.visible), true);
    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      console.log(instanceId);
      instanceMesh.getMatrixAt(instanceId, tmpM);
      selectPoints.matrix.copy(instanceMesh.matrixWorld);
      selectPoints.matrix.multiply(tmpM);
      selectPoints.matrix.decompose(selectPoints.position, selectPoints.quaternion, selectPoints.scale);
      selectPoints.scale.set(1.01, 1.01, 1.01);
      selectPoints.visible = true;
      transformControls.attach(selectPoints);
      selectId = instanceId;
    } else {
      selectId = null;
      selectPoints.visible = false;
      transformControls.detach();
    }
    render();
  })


  updateInstanceMesh()

  render();

  gui.add(controls, 'key', Object.keys(geometryPool)).onChange(
    () => {
      mesh.geometry = geometryPool[controls.key];
      updateInstanceMesh();
      transformControls.detach();
      selectPoints.visible = false;
      render();
    }
  );
  gui.add(controls, 'wireframe').onChange((e) => {
    mesh.material.wireframe = controls.wireframe;
    instanceMesh.visible = controls.wireframe;
    transformControls.detach();
    selectPoints.visible = false;
    render();
  })
}

function isEqual(v1, v2, epsilon = 1e-5) {
  // 计算两个向量的 x, y, z 方向的差值的绝对值，并与 epsilon 比较
  return (
    Math.abs(v1.x - v2.x) <= epsilon &&
    Math.abs(v1.y - v2.y) <= epsilon &&
    Math.abs(v1.z - v2.z) <= epsilon
  );
}

