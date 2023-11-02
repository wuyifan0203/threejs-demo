/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-21 17:28:48
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-02 11:26:41
 * @FilePath: /threejs-demo/examples/src/texture/block.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Scene,
  TextureLoader,
  PerspectiveCamera,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { initOrbitControls, initRenderer, } from '../lib/tools/index.js';

const basePath = '../../public/images/block/rock_wall_';
const url = {
  color: `${basePath}diff.jpg`,
  displacement: `${basePath}disp.png`,
  normal: `${basePath}nor_gl.exr`,
  roughness: `${basePath}rough.exr`,
};

const loader = new TextureLoader();

const texture = {
  color: loader.load(url.color),
  displacement: loader.load(url.displacement),
  normal: loader.load(url.normal),
  roughness: loader.load(url.roughness),
};

window.onload = async () => {
  init()
}


function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0.5;
  camera.lookAt(10, 0, 0);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);

  const controls = initOrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxDistance = 50;
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.clear();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }
}
