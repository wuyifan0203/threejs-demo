/*
 * @Date: 2023-07-20 10:41:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-29 13:43:27
 * @FilePath: /threejs-demo/src/geometry/preview.js
 */
import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineLoop,
  LineBasicMaterial,
} from 'three';
import {
  initRenderer,
  initAxesHelper,
  initCustomGrid,
  resize,
  initGUI,
  initOrbitControls,
  initScene,
  initOrthographicCamera
} from '../lib/tools/index.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { data } from './previewData.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initOrthographicCamera(new Vector3(14, -16, 13));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  renderer.setAnimationLoop(animate);
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  function animate() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  const material = new LineBasicMaterial({
    depthTest: true,
    // wireframe: true,
    side: 2,
    color: 'red',
  });

  const settings = { sourceData: 'data1' };

  const group = new Group();

  const gui = initGUI();

  const getOPtions = () => {
    const o = {};
    Object.keys(data).forEach((d) => {
      o[d] = d;
    });
    return o;
  };

  gui.add(settings, 'sourceData', getOPtions()).onChange(update);

  console.log(material);

  function update(key) {
    group.clear();
    const source = data[key];
    console.log(source);
    source.forEach((position) => {
      const geometry = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(position, 3));
      const mesh = new LineLoop(geometry, material);
      group.add(mesh);
    });
  }

  update(settings.sourceData);

  scene.add(group);
}
