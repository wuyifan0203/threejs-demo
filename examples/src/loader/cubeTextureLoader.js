/* eslint-disable no-param-reassign */
/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-25 01:01:36
 * @FilePath: /threejs-demo/examples/src/loader/cubeTextureLoader.js
 */
import {
  Scene,
  AmbientLight,
  Vector3,
  CubeTextureLoader,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer,
  resize,
  initPerspectiveCamera,
} from '../lib/tools/index.js';
import { GUI } from '../lib/util/lil-gui.module.min.js';;

function draw(scene) {
  const controls = {
    background: 'sky1',
  };
  const urls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
  const loader = new CubeTextureLoader();
  const loadBackground = (path = 'sky1') => {
    loader.setPath(`../../public/images/${path}/`);
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

  const gui = new GUI();
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
