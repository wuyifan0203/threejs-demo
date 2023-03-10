/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-02-02 18:30:01
 * @FilePath: /threejs-demo/src/examples/loader/rgbeLoader.js
 */
import {
  Scene,
  Vector3,
  HalfFloatType,
  Mesh,
  SphereGeometry,
  MeshStandardMaterial,
  CubeCamera,
  WebGLCubeRenderTarget,
  BoxGeometry,
  AmbientLight,
  ACESFilmicToneMapping,
  sRGBEncoding,
  TorusKnotGeometry,
  EquirectangularReflectionMapping,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
  initRenderer,
  resize,
  initPerspectiveCamera,
} from '../../lib/tools/index.js';
import dat from '../../lib/util/dat.gui.js';
import { RGBELoader } from '../../lib/three/RGBELoader.js';

window.onload = () => {
  init();
};

let stop = false;
function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(0, -2, 33));
  camera.lookAt(0, 0, 0);
  const scene = new Scene();
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setClearColor(0xffffff);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setAnimationLoop(animation);
  scene.add(new AmbientLight(0xffffff));
  scene.backgroundBlurriness = 0.02;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  const { cubeCamera, cube, torus } = draw(scene, renderer, controls);
  resize(renderer, camera);

  function animation(msTime) {
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

    cubeCamera.update(renderer, scene);

    controls.update();

    renderer.render(scene, camera);
  }

  window.camera = camera;
  window.scene = scene;
}

function draw(scene, renderer, OrbitControls) {
  const material = new MeshStandardMaterial({ roughness: 0.05, metalness: 1 });
  const sphere = new Mesh(new SphereGeometry(7, 64, 64), material);
  scene.add(sphere);

  const material2 = new MeshStandardMaterial({ roughness: 0.1, metalness: 0 });
  const cube = new Mesh(new BoxGeometry(15, 15, 15), material2);
  scene.add(cube);

  const torus = new Mesh(new TorusKnotGeometry(8, 3, 128, 16), material2);
  scene.add(torus);

  const cubeRenderTarget = new WebGLCubeRenderTarget(256);
  cubeRenderTarget.texture.type = HalfFloatType;
  const cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget);
  scene.add(cubeCamera);

  sphere.material.envMap = cubeRenderTarget.texture;
  sphere.material.needsUpdate = true;

  const controls = {
    background: 'sky1',
    blurriness: scene.backgroundBlurriness,
    stop,
  };

  const loader = new RGBELoader();
  const loadBackground = (path) => {
    loader.setPath(`../../resources/texture/${path}/`);
    const texture = loader.load(
      `${path}.hdr`,
      (texture) => {
        console.log('Load finished !');
      },
      (ProgressEvent) => {
        console.log(
          `progress: ${(ProgressEvent.loaded / ProgressEvent.total) * 100} %`,
        );
      },
      (url) => {
        console.log(`Opp ! have an Error in${url}`);
      },
    );
    // ??????????????????
    texture.mapping = EquirectangularReflectionMapping;

    scene.background = texture;
    scene.environment = texture;
  };
  loadBackground(controls.background);

  const gui = new dat.GUI();

  gui.add(renderer, 'toneMappingExposure', 0, 2, 0.01).name('exposure');
  gui.add(material, 'roughness', 0, 1, 0.01);
  gui.add(material, 'metalness', 0, 1, 0.01);
  gui.add(scene, 'backgroundBlurriness', 0, 1, 0.01).name('blurriness');
  gui.add(controls, 'stop').onChange((e) => {
    stop = e;
  });
  gui.add(OrbitControls, 'autoRotate');

  return {
    cubeCamera,
    cube,
    torus,
  };
}
