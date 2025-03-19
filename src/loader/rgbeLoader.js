/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-19 10:21:07
 * @FilePath: \threejs-demo\src\loader\rgbeLoader.js
 */
import {
  Vector3,
  HalfFloatType,
  Mesh,
  SphereGeometry,
  MeshStandardMaterial,
  CubeCamera,
  WebGLCubeRenderTarget,
  BoxGeometry,
  ACESFilmicToneMapping,
  SRGBColorSpace,
  TorusKnotGeometry,
  EquirectangularReflectionMapping,
  RGBAFormat,
} from 'three';
import {
  initRenderer,
  resize,
  initPerspectiveCamera,
  initScene,
  initOrbitControls,
  initGUI,
  initAmbientLight,
  Image_Path,
} from '../lib/tools/index.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

window.onload = () => {
  init();
};

let stop = false;
async function init() {
  const renderer = initRenderer({
    outputEncoding: SRGBColorSpace,
    toneMapping: ACESFilmicToneMapping,
  });

  const camera = initPerspectiveCamera(new Vector3(60, -5, 60));
  camera.lookAt(0, 0, 0);

  const scene = initScene();
  scene.backgroundBlurriness = 0.02;

  initAmbientLight(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;

  const material = new MeshStandardMaterial({ roughness: 0.05, metalness: 1 });
  const material2 = new MeshStandardMaterial({ roughness: 0.1, metalness: 0 });

  const sphere = new Mesh(new SphereGeometry(7, 64, 64), material);
  scene.add(sphere);

  const cube = new Mesh(new BoxGeometry(15, 15, 15), material2);
  scene.add(cube);

  const torus = new Mesh(new TorusKnotGeometry(8, 3, 128, 16), material2);
  scene.add(torus);

  const cubeRenderTarget = new WebGLCubeRenderTarget(512, {
    type: HalfFloatType,
    format: RGBAFormat,
    encoding: SRGBColorSpace
  });
  const cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget);
  scene.add(cubeCamera);
  sphere.material.envMap = cubeRenderTarget.texture;
  sphere.material.needsUpdate = true;

  const textureList = ['sky1', 'sky2', 'OutdoorField']
  const texture = await loadTexture(textureList);

  const params = {
    blurriness: scene.backgroundBlurriness,
    stop,
    background: 0
  };

  function updateBackground(index) {
    scene.background = scene.environment = texture[index];
    // 立即强制更新 cubeCamera
    cubeCamera.update(renderer, scene);
  }

  updateBackground(params.background)
  resize(renderer, camera);

  function render(msTime) {
    if (!stop) {
      const time = msTime / 1000;
      cube.position.x = Math.cos(time) * 30;
      cube.position.y = Math.sin(time) * 30;
      cube.position.z = Math.sin(time) * 30;
      cube.rotation.x += 0.02;
      cube.rotation.y += 0.03;
      torus.position.x = Math.cos(time + 10) * 30;
      torus.position.y = Math.sin(time + 10) * 30;
      torus.position.z = Math.sin(time + 10) * 30;
      torus.rotation.x += 0.02;
      torus.rotation.y += 0.03;
    }

    controls.update();

    cubeCamera.update(renderer, scene);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();


  const gui = initGUI();
  gui.add(params, 'background', { sky1: 0, sky2: 1, OutdoorField: 2 }).onChange(updateBackground)
  gui.add(renderer, 'toneMappingExposure', 0, 2, 0.01).name('exposure');
  gui.add(material, 'roughness', 0, 1, 0.01);
  gui.add(material, 'metalness', 0, 1, 0.01);
  gui.add(scene, 'backgroundBlurriness', 0, 1, 0.01).name('blurriness');
  gui.add(params, 'stop').onChange((e) => {
    stop = e;
  });
  gui.add(controls, 'autoRotate');

}


async function  loadTexture (list) {
  const loader = new RGBELoader();
  loader.setPath(`../../${Image_Path}/hdr/`);

  return await Promise.all(list.map((name) => {
    return new Promise((resolve, reject) => {
      loader.load(`${name}.hdr`, (texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        texture.name = name;
        resolve(texture);
      }, undefined, (...arg) => {
        reject(...arg);
      });
    });
  }))
};