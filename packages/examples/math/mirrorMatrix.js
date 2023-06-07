/* eslint-disable no-unused-vars */

import {
  Scene,
  Mesh,
  BufferGeometry,
  Vector3,
  DoubleSide,
  LineBasicMaterial,
  EdgesGeometry,
  BufferAttribute,
  LineSegments,
  MeshBasicMaterial,
  BoxBufferGeometry,
  MeshLambertMaterial,
  Matrix4,
  Euler,
  Quaternion,
  Points,
  PointsMaterial,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';

import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initAxesHelper,
  initDefaultLighting,
  rotationFormula,
  createMirrorMatrix,
  normal2Euler,
} from '../../lib/tools/index.js';

(function () {
  init();
}());

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = new Scene();

  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);
  const light = initDefaultLighting(scene);
  initAxesHelper(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    light.position.copy(camera.position);
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function draw(scene) {
  const basicMaterial = new MeshLambertMaterial({
    // side: DoubleSide,
    transparent: true,
    opacity: 1,
    depthTest: false,
    color: 0xcddc39,
    wireframe: true,
  });

  const box = new BoxBufferGeometry(4, 4, 4);
  const boxMesh = new Mesh(box, basicMaterial);
  const centerBuffer = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0]), 3));
  const pointMaterial = new PointsMaterial({ color: 0xff0000, size: 5 });
  const centerPoint = new Points(centerBuffer, pointMaterial);
  boxMesh.add(centerPoint);
  boxMesh.name = 'box';
  scene.add(boxMesh);

  const boxMesh2 = new Mesh(box, basicMaterial);
  const pointMaterial2 = new PointsMaterial({ color: 0x0000ff, size: 3 });
  const centerPoint2 = new Points(centerBuffer, pointMaterial2);
  boxMesh2.add(centerPoint2);
  boxMesh2.name = 'box2';
  scene.add(boxMesh2);

  const position = new Vector3(5, 5, 0);
  const quaternion = new Quaternion().setFromEuler(new Euler(0, 0, 0));
  const scale = new Vector3(1, 1, 1);

  const normal = new Vector3(1, 1, 0);
  const origin = new Vector3(1, 1, 0);

  const modelMatrix = new Matrix4().compose(position, quaternion, scale);

  const translateMatrix = new Matrix4().makeTranslation(-5, -1, 0);

  const rotateMatrix = new Matrix4().makeRotationFromEuler(new Euler(45, 0, 0));

  const mirrorMatrix = createMirrorMatrix(normal, origin);

  const result = new Matrix4().multiplyMatrices(translateMatrix, modelMatrix);
  const MResult = new Matrix4().multiplyMatrices(mirrorMatrix, result);
  const MResult2 = new Matrix4().multiplyMatrices(result, mirrorMatrix);

  const smallGrid = initCustomGrid(scene, 10, 10, 0x00ff00);
  const vec3Before = new Vector3(0, 0, 1);
  const vec3After = normal.clone().normalize();
  const gridRotateMatrix = rotationFormula(vec3Before, vec3After);
  const gridPosition = new Matrix4().makeTranslation(origin.x, origin.y, origin.z);
  smallGrid.applyMatrix4(new Matrix4().multiplyMatrices(gridPosition, gridRotateMatrix));

  const bool = 1;

  bool === 1 ? console.log('result') : console.log('result2');

  boxMesh.applyMatrix4(result);
  boxMesh2.applyMatrix4(bool === 1 ? MResult : MResult2);

  console.dir(scene.children);
}
