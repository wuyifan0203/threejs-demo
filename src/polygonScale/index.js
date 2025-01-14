/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-17 10:55:24
 * @FilePath: /threejs-demo/packages/examples/polygonScale/index.js
 */
/*
 * @Date: 2022-11-29 19:36:35
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-10 15:15:18
 * @FilePath: /threejs-demo/packages/examples/polygonScale/index.js
 */
import { data } from './data.js';
import {
  Scene,
  Mesh,
  BufferGeometry,
  Vector3,
  BufferAttribute,
  MeshBasicMaterial,
} from 'three';
import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initAxesHelper,
  angle2Radians,
  initOrbitControls
} from '../lib/tools/index.js';
import { innerPoints } from './compute.js';

import { EarCut } from './Earcut.js';
import { FaceNormalsHelper } from '../lib/custom/FaceNormalsHelper.js';
import { GUI } from '../lib/util/lil-gui.module.min.js';

(function () {
  init();
}());

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = initScene();
  initAxesHelper(scene);
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function draw(scene) {
  const newM = new MeshBasicMaterial({
    side: 2,
    opacity: 0.5,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    color: 'skyblue',
    wireframe: false,
  });

  let mesh; let meshNormal;
  draw3DMesh(data.data10, 90, 0.5, 0.2);
  scene.add(mesh);
  scene.add(meshNormal);

  function draw3DMesh(data, angle, h) {
    const bufferG = new BufferGeometry();
    const halfH = h / 2;
    const testData = data;
    // 一维点二维化
    const pointList = splicePoint(testData);
    // 二维点转三维点
    const bottomVertex = vec2ToVec3Vertex(pointList, halfH);
    // 耳切法算出索引
    const bottomIndex = EarCut.triangulate(testData);
    let d = 0;
    if (angle > 90) {
      d = halfH / Math.tan(angle2Radians(angle - 90));
    } else {
      d = -halfH / Math.tan(angle2Radians(angle));
    }
    const expendResult = expendWidth(pointList, d);
    const topVertex = vec2ToVec3Vertex(expendResult, -halfH);
    const topIndex = EarCut.triangulate(testData);
    const totalVertices = bottomVertex.concat(topVertex);
    const pointMap = new Map();
    for (let i = 0; i < totalVertices.length - 2; i += 3) {
      pointMap.set(JSON.stringify([totalVertices[i], totalVertices[i + 1], totalVertices[i + 2]]), i / 3);
    }
    const dIndex = pointMap.size / 2;
    const newTopIndex = convertIndex(topIndex, dIndex);
    const totalIndex = bottomIndex.concat(newTopIndex);
    const asideIndex = addAllSide(bottomVertex, topVertex, pointMap);

    bufferG.setAttribute('position', new BufferAttribute(new Float32Array(totalVertices), 3));
    bufferG.setIndex(totalIndex.concat(asideIndex));
    bufferG.computeVertexNormals();

    mesh = new Mesh(bufferG, newM);
    meshNormal = new FaceNormalsHelper(mesh, 1);
  }

  const object = {
    data: 'data1',
    angle: 90,
    height: 0.5,
  };

  const gui = new GUI();

  gui.add(object, 'data', Object.keys(data)).name('Data Source').onChange(() => update());
  gui.add(object, 'angle', 1, 179, 1).name('Angle').onChange(() => update());
  gui.add(object, 'height', 0.1, 10, 0.1).name('Height').onChange(() => update());
  gui.add(newM, 'wireframe').name('Material Wireframe');
  gui.add(meshNormal, 'visible').name('Normal helper');

  function update() {
    scene.remove(mesh);
    scene.remove(meshNormal);
    draw3DMesh(data[object.data], object.angle, object.height);
    scene.add(mesh);
    scene.add(meshNormal);
  }
}

function splicePoint(data) {
  const pointList = [];
  if (data.length) {
    for (let i = 0; i <= data.length - 1; i += 2) {
      pointList.push([data[i], data[i + 1]]);
    }
  }
  return pointList;
}

function addAllSide(top, bottom, map) {
  if (top.length !== bottom.length) return console.warn('length not equal!');

  const asideIndex = [];

  const up = vertex2PointList(top);
  const down = vertex2PointList(bottom);
  const { length } = up;
  for (let i = 0; i < length - 1; i++) {
    const upOneIndex = map.get(JSON.stringify(up[i]));
    const upTwoIndex = map.get(JSON.stringify(up[i + 1]));
    const downOneIndex = map.get(JSON.stringify(down[i]));
    const downTwoIndex = map.get(JSON.stringify(down[i + 1]));
    asideIndex.push(...addOneSideIndexInverse(upOneIndex, upTwoIndex, downOneIndex, downTwoIndex));
  }

  asideIndex.push(...addOneSideIndexInverse(map.get(JSON.stringify(up[length - 1])), map.get(JSON.stringify(up[0])), map.get(JSON.stringify(down[length - 1])), map.get(JSON.stringify(down[0]))));

  return asideIndex;
}

function vertex2PointList(vertex) {
  const { length } = vertex;
  const pointList = [];
  for (let i = 0; i < length - 2; i += 3) {
    pointList.push([vertex[i], vertex[i + 1], vertex[i + 2]]);
  }
  return pointList;
}

// eslint-disable-next-line no-unused-vars
function addOneSideIndex(upOneIndex, upTwoIndex, downOneIndex, downTwoIndex) {
  return [upOneIndex, downTwoIndex, upTwoIndex, upOneIndex, downOneIndex, downTwoIndex];
}
function addOneSideIndexInverse(upOneIndex, upTwoIndex, downOneIndex, downTwoIndex) {
  return [upOneIndex, upTwoIndex, downTwoIndex, upOneIndex, downTwoIndex, downOneIndex];
}

function vec2ToVec3Vertex(pointList, h = 0) {
  const vertices = [];
  const { length } = pointList;
  for (let index = 0; index < length; index++) {
    vertices.push(...pointList[index], h);
  }
  return vertices;
}

function expendWidth(pointList, width) {
  const result = [];
  const { length } = pointList;
  for (let i = 0, j = length - 1; i < length; j = i++) {
    const q = i === length - 1 ? 0 : i + 1;
    result.push(innerPoints(pointList[j], pointList[i], pointList[q], width));
  }

  return result;
}

function convertIndex(index, offset = 0) {
  const newIndex = [];
  const length = index.length - 2;
  for (let i = 0; i < length; i += 3) {
    newIndex.push(index[i + 2] + offset);
    newIndex.push(index[i + 1] + offset);
    newIndex.push(index[i] + offset);
  }
  return newIndex;
}
