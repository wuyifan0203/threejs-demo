/*
 * @Date: 2022-11-16 15:00:21
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-02-24 15:34:15
 * @FilePath: /threejs-demo/src/examples/edge/index2.js
 */

import {
  Scene,
  Vector3,
  LineBasicMaterial,
  EdgesGeometry,
  LineSegments,
  BoxGeometry,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  createAxesHelper,
} from '../../lib/tools/index.js';

import { LineMaterial } from '../../lib/three/LineMaterial.js';
import { LineSegments2 } from '../../lib/three/LineSegments2.js';
import { LineSegmentsGeometry } from '../../lib/three/LineSegmentsGeometry.js';
import dat from '../../lib/util/dat.gui.js'

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
  const geometry = new LineSegmentsGeometry();
  geometry.fromEdgesGeometry(edge);
  // 3. 创建 LineMaterial，设置颜色和线宽
  const material = new LineMaterial({
    color: 0xff0000,
    linewidth: 3,
    wireframe: false
  });
  // 4. 设置材质分辨率
  material.resolution.set(window.innerWidth, window.innerHeight);
  // 5. 创建 Line2
  const line = new LineSegments2(geometry, material);
  // 6. 计算下线条长度
  //   line.computeLineDistances();
  // 7. 添加到场景
  scene.add(line, l);
  console.log(scene);

  const gui = new dat.GUI();
  gui.add(material,'linewidth',0.5,10,0.1);
  gui.add(material,'wireframe');
}
