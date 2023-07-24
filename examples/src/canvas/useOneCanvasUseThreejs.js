/*
 * @Date: 2023-05-04 13:54:25
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-25 00:50:42
 * @FilePath: /threejs-demo/examples/src/canvas/useOneCanvasUseThreejs.js
 */
import {
  Scene, Vector3, WebGLRenderer,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import { CustomGrid } from '../lib/three/customGrid.js';
import { initOrthographicCamera } from '../lib/tools/common.js';


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
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  const scene = new Scene();
  const grid = new CustomGrid(30, 30, 1, 1);
  scene.add(grid);
  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, 0, 0);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 200, 200);
    ctx.font = '18px serif';
    ctx.fillText('this is canvas 2D', 200, 50);
    requestAnimationFrame(render);
  }

  render();
}
