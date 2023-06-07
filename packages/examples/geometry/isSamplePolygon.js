/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-04-12 13:24:47
 * @FilePath: /threejs-demo/src/examples/ParametricGeometry/index.js
 */
import {
  Vector3,
  Scene,
  LineLoop,
  BufferGeometry,
  LineBasicMaterial,
  BufferAttribute,
  Vector2,
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initAxesHelper,
  initCustomGrid,
  resize,
  initOrthographicCamera,
  isComplexPolygon,
} from '../../lib/tools/index.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';

import { GUI } from '../../lib/util/lil-gui.module.min.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = new OrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  const test1 = [
    new Vector3(0, 0, 0),
    new Vector3(5, 0, 0),
    new Vector3(5, 5, 0),
    new Vector3(0, 5, 0),
  ];

  const test2 = [
    new Vector3(0, 0, 0),
    new Vector3(5, 0, 0),
    new Vector3(0, 5, 0),
    new Vector3(5, 5, 0),
  ];

  const test3 = [
    new Vector3(0, 0, 0),
    new Vector3(5, 0, 0),
    new Vector3(0, 6, 0),
    new Vector3(2, 5, 0),
    new Vector3(0, 5, 0),
  ];

  const test4 = [
    new Vector3(0, 0, 0),
    new Vector3(5, 0, 0),
    new Vector3(5, 5, 0),
  ];

  const test5 = [
    new Vector2(-2, -1, 0),
    new Vector2(-4, -2, 0),
    new Vector2(4, -2, 0),
    new Vector2(2, 2, 0),
  ];

  const test6 = [
    new Vector3(0, 0, 0),
    new Vector3(5, 0, 0),
    new Vector3(2.5, 5, 0),
  ];

  const test7 = [
    new Vector3(0, 0, 0),
    new Vector3(5, 0, 0),
    new Vector3(10, 5, 0),
  ];

  const testList = {
    test1, test2, test3, test4, test5, test6, test7,
  };

  const geometry = new BufferGeometry();
  const material = new LineBasicMaterial({ color: 'orange' });
  const lineLoop = new LineLoop(geometry, material);

  lineLoop.position.z = 2;

  scene.add(lineLoop);

  const position = [];

  function convertPosition(points) {
    position.length = 0;
    points.forEach((p) => {
      position.push(p.x, p.y, p.z);
    });
  }

  const controlers = {
    select: 'test1',
    log() {
      console.log(isComplexPolygon(testList[this.select]));
    },
  };

  convertPosition(testList[controlers.select]);
  lineLoop.geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
  lineLoop.geometry.getAttribute('position').needsUpdate = true;

  const gui = new GUI();

  gui.add(controlers, 'select', Object.keys(testList)).onChange((e) => {
    convertPosition(testList[e]);
    lineLoop.geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
    lineLoop.geometry.getAttribute('position').needsUpdate = true;
  });

  gui.add(controlers, 'log').name('Log is Sample Polygon (press F12)');

  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    requestAnimationFrame(render);
  }
  window.camera = camera;
  window.scene = scene;

  render();
}
