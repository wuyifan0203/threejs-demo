/*
 * @Date: 2022-11-16 15:00:21
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-05 15:38:10
 * @FilePath: /threejs-demo/examples/src/line/line2.js
 */

import {
  Scene,
  Vector3,
  LineBasicMaterial,
  EdgesGeometry,
  LineSegments,
  BoxGeometry,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initAxesHelper,
} from '../lib/tools/index.js';

import { LineMaterial } from '../lib/three/LineMaterial.js';
import { LineSegments2 } from '../lib/three/LineSegments2.js';
import { LineSegmentsGeometry } from '../lib/three/LineSegmentsGeometry.js';
import { GUI } from '../lib/util/lil-gui.module.min.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = new Scene();
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
//   const [x, y, z] = [6, 10, 4];

  // 2. 创建 LineGeometry，并设置空间点
  const g = new BoxGeometry(5, 6, 4);
  const edge = new EdgesGeometry(g);
  const l = new LineSegments(edge, new LineBasicMaterial({ color: 'green' }));
  // 注意
  // LineSegmentsGeometry 不支持带index的geometry ，测试半天，才发现
  const geometry = new LineSegmentsGeometry();
  geometry.fromEdgesGeometry(edge);
  // 3. 创建 LineMaterial，设置颜色和线宽
  const material = new LineMaterial({
    color: 0xff0000,
    linewidth: 3,
    wireframe: false,
  });
  // 4. 设置材质分辨率
  material.resolution.set(window.innerWidth, window.innerHeight);
  // 5. 创建 Line2
  const line = new LineSegments2(geometry, material);
  // 6. 计算下线条长度
  //   line.computeLineDistances();
  // 7. 添加到场景
  scene.add(line);
  scene.add(l);

  const gui = new GUI();
  gui.add(material, 'linewidth', 0.5, 10, 0.1);
  gui.add(material, 'wireframe');
}