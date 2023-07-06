/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-06 11:18:20
 * @FilePath: /threejs-demo/packages/examples/render/useRenderTarget.js
 */
/* eslint-disable no-unused-vars */

import {
  Scene,
  Mesh,
  Vector3,
  AmbientLight,
  DirectionalLight,
  BoxGeometry,
  MeshStandardMaterial,
  Clock,
  WebGLRenderTarget,
  Vector2,
  SRGBColorSpace,
  Color,
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
  // 这是默认值
  // renderer.outputEncoding = SRGBColorSpace;

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

  const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { colorSpace: SRGBColorSpace });

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
      // 长 * 宽 * RGBA（4位）
      // Uint 因为 2^8 = 255 ,无符号整数
      const pixels = new Uint8Array(x * y * 4);

      target.setSize(x, y);

      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.readRenderTargetPixels(target, 0, 0, x, y, pixels);

      const canvas = document.createElement('canvas');
      canvas.width = x;
      canvas.height = y;
      const context = canvas.getContext('2d');
      const imageData = context.createImageData(x, y);
      imageData.data.set(pixels);
      context.putImageData(imageData, 0, 0);

      // 翻转图像。webgl 与 canvas 坐标系不同
      context.translate(0, y);
      context.scale(1, -1);
      context.drawImage(canvas, 0, 0, x, y, 0, 0, x, y);

      addWaterMark(context, 'Test', 5, 10, 10, 10);

      // 生成base64
      const dataURL = canvas.toDataURL('image/png');

      // 图片下载
      eleLink.download = 'test';
      eleLink.href = dataURL;
      eleLink.click();

      // 调试
      console.log(
        '%c image',
        `background-image: url(${dataURL});
         background-size: contain;
         background-repeat: no-repeat;
         padding: 200px;
        `,
      );
    },
  };

  const gui = new GUI();
  gui.add(func, 'renderTarget');
}

function addWaterMark(ctx, text, col, row, ph, pw) {
  ctx.font = '20px microsoft yahei';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  const { height, width } = ctx.measureText(text);
  for (let c = 0; c < col; c++) {
    const ch = c * (ph + height);
    for (let r = 0; r < row; r++) {
      ctx.rotate((-45 * Math.PI) / 180);
      ctx.fillText(text, ch, r * (pw + width));
      ctx.rotate((45 * Math.PI) / 180); // 把水印偏转角度调整为原来的，不然他会一直转
    }
  }
}
