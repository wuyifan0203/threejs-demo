/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-05 17:46:32
 * @FilePath: /threejs-demo/packages/examples/render/useRenderTarget.js
 */
/* eslint-disable no-unused-vars */

import {
  Scene,
  Mesh,
  Vector3,
  AmbientLight,
  DirectionalLight,
  MeshNormalMaterial,
  BoxGeometry,
  MeshStandardMaterial,
  Clock,
  WebGLRenderTarget,
  TextureLoader,
  Vector2,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ImprovedNoise } from '../../lib/three/ImprovedNoise.js';

import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initGroundPlane,
} from '../../lib/tools/index.js';
import { GUI } from '../../lib/util/lil-gui.module.min.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  renderer.shadowMap.enabled = true;

  const camera = initOrthographicCamera(new Vector3(-1000, 1000, 1000));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  const scene = new Scene();

  renderer.setClearColor(0xffffff);

  const orbitControl = new OrbitControls(camera, renderer.domElement);

  const light = new DirectionalLight();
  light.castShadow = true;
  light.position.set(20, 20, 20);
  light.target = scene;

  scene.add(light);

  resize(renderer, camera);

  initGroundPlane(scene);

  // 创建一个平面几何体
  const geometry = new BoxGeometry(5, 4, 3);
  const material = new MeshStandardMaterial({ color: 0x049ef4, roughness: 0 });
  scene.add(new AmbientLight());
  const mesh = new Mesh(geometry, material);
  mesh.position.set(0, 0, 6);
  mesh.castShadow = true;
  scene.add(mesh);

  const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight);

  const clock = new Clock();
  function render() {
    orbitControl.update();
    const time = clock.getElapsedTime();
    mesh.rotation.x = time * 2;
    mesh.rotation.y = time * 2;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  const eleLink = document.createElement('a');
  document.body.appendChild(eleLink);
  eleLink.style.display = 'none';

  const size = new Vector2();
  const func = {
    renderTarget() {
      renderer.getSize(size);

      const { x, y } = size;

      target.setSize(x, y);
      renderer.render(scene, camera, target);

      const pixels = new Uint8Array(x * y * 4);
      renderer.readRenderTargetPixels(target, 0, 0, x, y, pixels);

      const canvas = document.createElement('canvas');
      canvas.width = x;
      canvas.height = y;
      const context = canvas.getContext('2d');
      const imageData = context.createImageData(x, y);
      imageData.data.set(pixels);
      context.putImageData(imageData, 0, 0);
      const dataURL = canvas.toDataURL('image/png');

      eleLink.download = 'test';
      eleLink.href = dataURL;
      eleLink.click();
    },
  };

  const gui = new GUI();
  gui.add(func, 'renderTarget');
}
