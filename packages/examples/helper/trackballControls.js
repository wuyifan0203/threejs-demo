/*
 * @Date: 2023-05-17 19:27:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-20 18:29:19
 * @FilePath: /threejs-demo/packages/examples/helper/trackballControls.js
 */
import {
  Vector3,
  Scene,
  Mesh,
  MeshNormalMaterial,
  BoxGeometry,
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
  initOrthographicCamera,
} from '../../lib/tools/index.js';
import { TrackballControls } from '../../lib/three/TrackballControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(1000,1000, 1000));
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = new TrackballControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  controls.rotateSpeed = 3.0;
	controls.zoomSpeed = 3;
	controls.panSpeed = 0.8;
  controls.staticMoving= true

  draw(scene);

  render();
  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    requestAnimationFrame(render);
  }
}

function draw(scene) {
  const mesh = new Mesh(new BoxGeometry(4, 4, 4), new MeshNormalMaterial());

  scene.add(mesh);
}
