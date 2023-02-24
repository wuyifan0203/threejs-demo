/*
 * @Date: 2022-11-29 19:36:35
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-31 18:05:51
 * @FilePath: /threejs-demo/src/examples/pology/index.js
 */
import {
  // eslint-disable-next-line no-unused-vars
  data, data1, data2, data3, data4, data5, data6, data7, data8, data9,
} from './data.js';
import {
  Scene,
  Mesh,
  BufferGeometry,
  Vector3,
  LineBasicMaterial,
  EdgesGeometry,
  BufferAttribute,
  LineSegments,
  MeshLambertMaterial,
  Matrix4,
  AmbientLight,
  DirectionalLight,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  createAxesHelper,
  angle2Radians,
  rotationFormula,
} from '../../lib/tools/index.js';
import { innerPoints } from './compute.js';

import { EarCut } from './Earcut.js';
// eslint-disable-next-line no-unused-vars
import { VertexNormalsHelper } from '../../lib/three/VertexNormalsHelper.js';
import { Arrow } from '../../lib/three/Arrow.js';

(function () {
  init();
}());

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = new Scene();
  createAxesHelper(scene);
  renderer.setClearColor(0xffffff);
  initCustomGrid(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  scene.add(new AmbientLight());
  const light = new DirectionalLight(0xffffff, 1);
  scene.add(light);
  light.target = scene;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);

    renderer.render(scene, camera);
    light.position.set(camera.position);
  }
}

function draw(scene) {
  const testData = data9;
  // 一维点二维化
  const pointList = splicePoint(testData);
  // 二维点转三维点
  const bottomVertex = vec2ToVec3Vertex(pointList, 0.25);

  // 耳切法算出索引
  const bottomIndex = EarCut.triangulate(testData);
  // const bottomMaterial = new MeshBasicMaterial({
  //   color: 'green',
  //   // wireframe: true,
  //   side: 2
  // });
  // const bottomBuffer = new BufferGeometry();

  // bottomBuffer.setAttribute('position', new BufferAttribute(new Float32Array(bottomVertex), 3));
  // bottomBuffer.setIndex(bottomIndex);

  // const bottomMesh = new Mesh(bottomBuffer, bottomMaterial);
  // bottomBuffer.computeVertexNormals();

  // const bottomNormalHelper = new VertexNormalsHelper(bottomMesh, 0.5);
  // scene.add(bottomNormalHelper);

  // scene.add(bottomMesh);

  let d = 0;

  const angle = Math.abs(105);

  if (angle > 90) {
    d = 0.25 / Math.tan(angle2Radians(angle - 90));
  } else {
    d = -0.25 / Math.tan(angle2Radians(angle));
  }

  const before = new Vector3(0, 0, 1);
  const l = bottomVertex.length / 3 - 1;
  const b = bottomVertex;

  for (let i = 1; i < l; i++) {
    const pp = (i - 1) * 3;
    const dd = i * 3;
    const p = [b[pp], b[pp + 1], b[pp + 2]];
    const p1 = [b[dd], b[dd + 1], b[dd + 2]];
    // console.log(p, p1);
    const after = new Vector3().subVectors(new Vector3(...p1), new Vector3(...p));

    const arrow = new Arrow();
    const r = rotationFormula(before, after);
    r.multiply(new Matrix4().makeTranslation(...p));
    arrow.applyMatrix4(r);
    scene.add(arrow);
  }

  const expendResult = expendWidth(pointList, d);

  // console.log(expendResult);

  const topVertex = vec2ToVec3Vertex(expendResult, -0.25);

  // console.log(topVertex);

  const topIndex = EarCut.triangulate(testData);
  // const topMaterial = new MeshBasicMaterial({
  //   color: 'skyblue',
  //   // wireframe: true,
  //   side: 2
  // });
  // const topBuffer = new BufferGeometry();
  // topBuffer.setAttribute('position', new BufferAttribute(new Float32Array(topVertex), 3));
  // topBuffer.setIndex(topIndex);

  // const topMesh = new Mesh(topBuffer, topMaterial);
  // console.log(topIndex.length);
  // scene.add(topMesh);
  // topBuffer.computeVertexNormals();
  // const topNormalHelper = new VertexNormalsHelper(topMesh, 0.5);
  // scene.add(topNormalHelper);

  const totalVertices = bottomVertex.concat(topVertex);

  const pointMap = new Map();

  for (let i = 0; i < totalVertices.length - 2; i += 3) {
    pointMap.set(JSON.stringify([totalVertices[i], totalVertices[i + 1], totalVertices[i + 2]]), i / 3);
  }

  // console.log(pointMap);

  const dIndex = pointMap.size / 2;

  const newTopIndex = convertIndex(topIndex, dIndex);

  const totalIndex = bottomIndex.concat(newTopIndex);

  const asideIndex = addAllSide(bottomVertex, topVertex, pointMap);

  const newBuffer = new BufferGeometry();
  newBuffer.setAttribute('position', new BufferAttribute(new Float32Array(totalVertices), 3));
  newBuffer.setIndex(totalIndex.concat(asideIndex));
  newBuffer.computeVertexNormals();
  const newM = new MeshLambertMaterial({
    color: 'green',
    side: 2,
    opacity: 0.5,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    // wireframe: true
  });

  const newMesh = new Mesh(newBuffer, newM);
  scene.add(newMesh);

  const edges = new EdgesGeometry(newBuffer);
  const edgeMesh = new LineSegments(edges, new LineBasicMaterial({ color: 0x000000 }));
  scene.add(edgeMesh);

  // const meshNormal = new VertexNormalsHelper(newMesh, 0.5);

  // scene.add(meshNormal);

  console.log(scene);
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

  console.log(down[0]);
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
