/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-17 17:57:14
 * @FilePath: \threejs-demo\src\algorithms\isSamplePolygon.js
 */
import {
  Vector3,
  LineLoop,
  BufferGeometry,
  LineBasicMaterial,
  BufferAttribute,
  Vector2,
} from 'three';
import {
  initRenderer,
  initAxesHelper,
  initCustomGrid,
  resize,
  initOrthographicCamera,
  isComplexPolygon,
  initScene,
  initOrbitControls,
  initGUI,
  initViewHelper
} from '../lib/tools/index.js';


window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  const viewHelper =  initViewHelper(camera, renderer.domElement);

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

  const test8 = [
    new Vector3(0.3660254037844386, 0.9162310007165113, 0),
    new Vector3(0.3660254037844386, -0.9162310007165113, 0),
    new Vector3(0.4068437234019832, -0.9198202128554558, 0),
    new Vector3(0.3548990061097403, -0.9149610029779873, 0),
    new Vector3(0.3029765403790235, -0.9098560299259333, 0),
    new Vector3(0.25125312148107576, -0.9044619616284727, 0),
    new Vector3(0.19985722477718126, -0.8987004349356416, 0),
    new Vector3(0.14909142809142004, -0.8924517179356346, 0),
    new Vector3(0.10004889478379698, -0.8855556910297906, 0),
    new Vector3(0.15456460988750495, -0.8952830286177402, 0),
    new Vector3(0.10784113192958364, 0, 0),
    new Vector3(0.15456460988750495, 0.8952830286177402, 0),
    new Vector3(0.10004889478379698, 0.8855556910297906, 0),
    new Vector3(0.14909142809142004, 0.8924517179356346, 0),
    new Vector3(0.19985722477718126, 0.8987004349356416, 0),
    new Vector3(0.25125312148107576, 0.9044619616284727, 0),
    new Vector3(0.3029765403790235, 0.9098560299259333, 0),
    new Vector3(0.3548990061097403, 0.9149610029779873, 0),
    new Vector3(0.4068437234019832, 0.9198202128554558, 0),
  ];

  const testList = {
    test1,
    test2,
    test3,
    test4,
    test5,
    test6,
    test7,
    test8,
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

  const control = {
    select: 'test1',
    log() {
      console.log(isComplexPolygon(testList[this.select]));
    },
  };

  convertPosition(testList[control.select]);
  lineLoop.geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(position), 3),
  );
  lineLoop.geometry.getAttribute('position').needsUpdate = true;

  const gui = initGUI();

  gui.add(control, 'select', Object.keys(testList)).onChange((e) => {
    convertPosition(testList[e]);
    lineLoop.geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(position), 3),
    );
    lineLoop.geometry.getAttribute('position').needsUpdate = true;
  });

  gui.add(control, 'log').name('Log is Sample Polygon (press F12)');

  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  renderer.setAnimationLoop(render);

}
