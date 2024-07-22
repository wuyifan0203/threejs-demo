/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 11:24:07
 * @FilePath: /threejs-demo/src/camera/arrayCamera.js
 */
import {
  Mesh,
  MeshNormalMaterial,
  SphereGeometry,
  BoxGeometry,
  ArrayCamera,
  Vector3,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initAxesHelper,
  initCustomGrid,
  initPerspectiveCamera,
  initScene
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();

  const scene = initScene();
  initCustomGrid(scene, 100, 100);
  initAxesHelper(scene);

  const random = (a, b) => Math.random() * b - Math.random() * a;

  const cameras = [];
  for (let k = 0; k < 6; k++) {
    cameras.push(initPerspectiveCamera(new Vector3(random(-10, 10), random(-10, 10), random(-10, 10))));
  }
  const arrayCamera = new ArrayCamera(cameras);

  const updateCamera = () => {
    const aspect = window.innerWidth / window.innerHeight;
    const height = window.innerHeight / 2;
    const width = window.innerWidth / 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const sub = arrayCamera.cameras[i + j];
        console.log(sub);
        sub.aspect = aspect;
        sub.setViewOffset(window.innerWidth, window.innerHeight, i * width, j * height, width, height);
        sub.updateProjectionMatrix();
      }
    }
    arrayCamera.aspect = aspect;
    arrayCamera.updateProjectionMatrix();
  };
  updateCamera();

  window.addEventListener('resize', updateCamera);

  (function render() {
    renderer.render(scene, arrayCamera);
    requestAnimationFrame(render);
  })()

  const sphere1 = new SphereGeometry(5, 20, 16);
  const sphere2 = new SphereGeometry(3, 20, 16);
  const box = new BoxGeometry(4, 4, 4);

  const material = new MeshNormalMaterial({ wireframe: true });

  const sphere1Mesh = new Mesh(sphere1, material);
  const sphere2Mesh = new Mesh(sphere2, material);
  const boxMesh = new Mesh(box, material);

  sphere1Mesh.position.set(-6, 0, 0);
  sphere2Mesh.position.set(4, 0, 0);
  scene.add(sphere1Mesh, sphere2Mesh, boxMesh);
}
