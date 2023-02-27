/* eslint-disable no-param-reassign */
/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-30 18:20:06
 * @FilePath: /threejs-demo/src/examples/loader/cubeTextureLoader.js
 */
import {
  Scene,
  AmbientLight,
  Vector3,
  CubeTextureLoader,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
  initRenderer,
  resize,
  initPerspectiveCamera,
} from '../../lib/tools/index.js';
import dat from '../../lib/util/dat.gui.js';

function draw(scene) {
  const controls = {
    background: 'sky1',
  };
  const urls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
  const loader = new CubeTextureLoader();
  const loadBackground = (path = 'sky1') => {
    loader.setPath(`../../resources/texture/${path}/`);
    const texture = loader.load(
      urls,
      () => {
        console.log('Load finished !');
      },
      (url, loaded, total) => {
        console.log(`progress:${loaded / total}%`);
      },
      (url) => {
        console.error(`Opp ! have an Error in${url}`);
      },
    );
    scene.background = texture;
  };
  loadBackground(controls.background);

  const gui = new dat.GUI();
  gui
    .add(controls, 'background', ['sky1', 'sky2', 'snow_field'])
    .onChange((e) => {
      loadBackground(e);
    });
}

function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = initPerspectiveCamera(new Vector3(0, 0, 5));
  camera.lookAt(0, 0, 0);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  const ambientLight = new AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene, camera);
  resize(renderer, camera);

  function render() {
    controls.update();
    renderer.clear();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  window.camera = camera;
  window.scene = scene;
}

window.onload = () => {
  init();
};
