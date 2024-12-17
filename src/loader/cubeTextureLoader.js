/* eslint-disable no-param-reassign */
/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-14 13:22:24
 * @FilePath: \threejs-demo\src\loader\cubeTextureLoader.js
 */
import {
  Vector3,
  CubeTextureLoader,
} from 'three';
import {
  initRenderer,
  resize,
  initPerspectiveCamera,
  initScene,
  initGUI,
  initAmbientLight,
  initOrbitControls
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = initPerspectiveCamera(new Vector3(0, 0, 5));
  camera.lookAt(0, 0, 0);
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  initAmbientLight(scene)

  const controls = initOrbitControls(camera, renderer.domElement);
  draw(scene, camera);
  resize(renderer, camera);

  function render() {
    controls.update();
    renderer.clear();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

}

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

  const gui = initGUI();
  gui
    .add(controls, 'background', ['sky1', 'sky2', 'snow_field'])
    .onChange((e) => {
      loadBackground(e);
    });
}

