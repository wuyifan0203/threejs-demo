/*
 * @Date: 2023-05-04 13:54:25
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-01 16:06:40
 * @FilePath: /threejs-demo/src/canvas/useOneCanvasUseThreejs.js
 */
import {
  Vector3,
  WebGLRenderer,
} from '../lib/three/three.module.js';
import {
  initOrbitControls,
  initOrthographicCamera,
  initScene,
  initCustomGrid
} from '../lib/tools/common.js';


window.onload = () => {
  init();
};

function init() {
  const canvas2DDOM = document.createElement('canvas');
  canvas2DDOM.width = window.innerWidth;
  canvas2DDOM.height = window.innerHeight;
  const ctx = canvas2DDOM.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 200, 200);
  ctx.font = '18px serif';
  ctx.fillText('This is canvas 2D', 200, 50);
  document.body.append(canvas2DDOM);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor('#eeeeee');
  
  const camera = initOrthographicCamera(new Vector3(10, 10, 10));

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const scene = initScene();

  const grid = initCustomGrid(scene);
  scene.add(grid);

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, 0, 0);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 200, 200);
    ctx.font = '18px serif';
    ctx.fillText('this is canvas 2D', 200, 50);
  }

  renderer.setAnimationLoop(render);
}
