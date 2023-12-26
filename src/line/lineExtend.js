/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/*
 * @Date: 2022-11-16 15:00:21
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-25 01:00:07
 * @FilePath: /threejs-demo/examples/src/line/lineExtend.js
 */

import {
  Scene,
  Mesh,
  BufferGeometry,
  Vector3,
  LineBasicMaterial,
  EdgesGeometry,
  BufferAttribute,
  LineSegments,
  MeshBasicMaterial,
  BoxGeometry,
  Matrix4,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initAxesHelper,
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = initScene();
  initAxesHelper(scene);
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function draw(scene) {
  const [x, y, z] = [6, 10, 4];
  const g = new BoxGeometry(x, y, z);
  const lm = new LineBasicMaterial({ color: 'red' });
  const e = new EdgesGeometry(g);
  const l = new LineSegments(e, lm);
  createMesh(l, x, y, z, scene);
  scene.add(l);

  console.log(scene);
}

function createMesh(l, x, y, z, scene) {
  const [hx, hy, hz] = [x / 2, y / 2, z / 2];
  const m = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.1,
    color: '#bbb',
    depthTest: false,
  });

  const gm = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.1,
    color: 'green',
    depthTest: false,
  });
  const lm = new LineBasicMaterial({ color: '#000' });

  const [xMax, xMin, yMax, yMin, zMax, zMin] = [2, 4, 3, 1, 2, 3];

  const b1 = createPML(hx, hy, xMax, xMin, yMax, yMin, zMin, false);// bottom
  const b2 = createPML(hx, hy, xMax, xMin, yMax, yMin, zMax, true);// top

  const b3 = createPML(hx, hz, xMax, xMin, zMax, zMin, yMin, true); // front
  const b4 = createPML(hx, hz, xMax, xMin, zMax, zMin, yMax, false); // back

  const b5 = createPML(hz, hy, zMax, zMin, yMax, yMin, xMin, true); // left
  const b6 = createPML(hz, hy, zMax, zMin, yMax, yMin, xMax, false); // back

  const translateMatrix = new Matrix4();
  const rotateMatrix = new Matrix4();

  const m1 = new Mesh(b1, m);
  m1.applyMatrix4(translateMatrix.makeTranslation(0, 0, -hz - zMin / 2));
  const m2 = new Mesh(b2, m);
  m2.applyMatrix4(translateMatrix.makeTranslation(0, 0, hz + zMax / 2));
  l.add(m1);
  l.add(m2);

  const m3 = new Mesh(b3, m);
  m3.applyMatrix4(translateMatrix.makeTranslation(0, -hy - yMin / 2, 0).multiply(rotateMatrix.makeRotationX(Math.PI / 2)));
  const m4 = new Mesh(b4, m);
  m4.applyMatrix4(translateMatrix.makeTranslation(0, hy + yMax / 2, 0).multiply(rotateMatrix.makeRotationX(Math.PI / 2)));
  l.add(m3);
  l.add(m4);

  const m5 = new Mesh(b5, m);
  m5.applyMatrix4(translateMatrix.makeTranslation(-hx - xMin / 2, 0, 0).multiply(rotateMatrix.makeRotationY(-Math.PI / 2)));
  const m6 = new Mesh(b6, gm);
  m6.applyMatrix4(translateMatrix.makeTranslation(hx + xMax / 2, 0, 0).multiply(rotateMatrix.makeRotationY(-Math.PI / 2)));
  l.add(m5);
  l.add(m6);
}

//    3---------2
//   /|        /|
//  0---------1 |
//  | |       | |      z
//  | |       | |      |
//  | 5-------|-6      o--- x
//  |/        |/      /
//  4---------7      y

function createPML(x, y, xMax, xMin, yMax, yMin, h, isTop = true) {
  const hh = h / 2;
  const bottomVertex = [
    -x, y, hh,
    x, y, hh,
    x, -y, hh,
    -x, -y, hh,
    -(x + xMin), y + yMax, -hh,
    -(x + xMin), -(y + yMin), -hh,
    x + xMax, -(y + yMin), -hh,
    x + xMax, y + yMax, -hh,
  ];

  const topVertex = [
    -(x + xMin), y + yMax, hh, // 0
    x + xMax, y + yMax, hh, // 1
    x + xMax, -(y + yMin), hh, // 2
    -(x + xMin), -(y + yMin), hh, // 3
    -x, y, -hh, // 4
    -x, -y, -hh, // 5,
    x, -y, -hh, // 6
    x, y, -hh, // 7
  ];

  const index = [
    0, 1, 2, 0, 2, 3, // top
    4, 5, 6, 4, 6, 7, // bottom
    1, 7, 6, 1, 6, 2, // right
    4, 0, 3, 4, 3, 5, // left
    0, 4, 7, 0, 7, 1, // front
    5, 3, 2, 5, 2, 6, // back
  ];

  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(isTop ? topVertex : bottomVertex), 3));
  g.setIndex(index);
  return g;
}
