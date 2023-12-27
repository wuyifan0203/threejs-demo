/*
 * @Date: 2022-11-16 15:00:21
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 18:06:44
 * @FilePath: /threejs-demo/src/line/useLine.js
 */

import {
  Vector3,
  LineBasicMaterial,
  LineSegments,
  BufferGeometry,
  BufferAttribute,
  Path,
  Line,
  LineLoop,
} from '../lib/three/three.module.js';
import {
  initScene,
  initOrbitControls,
  initRenderer,
  initOrthographicCamera,
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

  const controls = initOrbitControls(camera, renderer.domElement);
  draw(scene);

  function render() {
    controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);
}

function draw(scene) {
  const LineMaterial = new LineBasicMaterial({ color: 'orange' });

  const vertex = [
    -5, 5, 0, -5, -5, 0, // 第一条线
    5, -5, 0, 5, 5, 0, // 第二条线
  ];

  const gemotry = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(vertex), 3));

  const path = new Path();
  path.absarc(0, 0, 5, 0, 2 * Math.PI, false);
  const gemotry2 = new BufferGeometry().setFromPoints(path.getPoints());

  const ls = new LineSegments(gemotry, LineMaterial);
  const ls2 = new LineSegments(gemotry2, LineMaterial);

  const l = new Line(gemotry, LineMaterial);
  const l2 = new Line(gemotry2, LineMaterial);

  const lp = new LineLoop(gemotry, LineMaterial);
  const lp2 = new LineLoop(gemotry2, LineMaterial);

  ls2.position.z = 2;
  l2.position.z = 2;
  l.position.x = l2.position.x = 12;
  lp.position.x = lp2.position.x = -12;
  lp2.position.z = 2;

  scene.add(ls, ls2);
  scene.add(l, l2);
  scene.add(lp, lp2);
}
