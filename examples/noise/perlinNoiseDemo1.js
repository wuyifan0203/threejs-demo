/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-05-06 09:51:26
 * @FilePath: /threejs-demo/packages/examples/noise/perlinNoiseDemo1.js
 */

import {
  Scene,
  Mesh,
  Vector3,
  AmbientLight,
  PlaneGeometry,
  MeshNormalMaterial,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ImprovedNoise } from '../../lib/three/ImprovedNoise.js';

import {
  initRenderer,
  initOrthographicCamera,
  resize,
} from '../../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  const scene = new Scene();

  renderer.setClearColor(0xffffff);

  const orbitControl = new OrbitControls(camera, renderer.domElement);

  resize(renderer, camera);

  // 创建一个平面几何体
  const geometry = new PlaneGeometry(100, 100, 200, 200);

  // 生成云层纹理
  const material = new MeshNormalMaterial({ side: 2 });

  scene.add(new AmbientLight());

  const noise = new ImprovedNoise();

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  const pos = geometry.attributes.position.array;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i + 2] = noise.noise(pos[i], pos[i + 1], Math.random());
  }

  geometry.computeVertexNormals();
  geometry.attributes.position.needsUpdate = true;

  render();
  function render() {
    orbitControl.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}
