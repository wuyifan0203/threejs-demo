/*
 * @Date: 2023-06-09 13:05:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-09 17:09:38
 * @FilePath: /threejs-demo/packages/examples/loader/jsonloader.js
 */

import {
  BoxGeometry,
  Color,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  ObjectLoader, Scene, SphereGeometry, Vector3, WebGLRenderer,
} from '../lib/three/three.module.js';
import {
  initOrbitControls, initOrthographicCamera, resize,
} from '../lib/tools/common.js';

window.onload = () => {
  init();
};

// eslint-disable-next-line consistent-return
function init() {
  const inputDOM = document.querySelector('#input');
  const outputDOM = document.querySelector('#output');

  if (!inputDOM || !outputDOM) {
    return console.warn('can`t find target dom');
  }

  const { width: w1, height: h1 } = inputDOM.getBoundingClientRect();
  const { width: w2, height: h2 } = outputDOM.getBoundingClientRect();

  const renderer1 = new WebGLRenderer({ antialias: true });
  const renderer2 = new WebGLRenderer({ antialias: true });
  renderer1.setSize(w1, h1);
  renderer2.setSize(w2, h2);

  inputDOM.append(renderer1.domElement);
  outputDOM.append(renderer2.domElement);

  const camera = initOrthographicCamera(new Vector3(100, 100, 100));
  camera.up.set(0, 0, 1);

  const scene1 = initScene();
  scene1.background = new Color('#ffffff');
  const sphere = new Mesh(new SphereGeometry(5), new MeshBasicMaterial({ color: '#00ff00' }));
  sphere.name = 'sphere';
  scene1.add(sphere);

  const gridHelper = new GridHelper(50, 50);
  gridHelper.name = 'gridHelper';
  scene1.add(gridHelper);
  let scene2 = initScene();

  //   initCustomGrid(scene1);
  // 会加载不出来报错，因为内部不会转译自定义Mesh

  scene2.add(new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial({ color: '#ff0000' })));
  resize(renderer1, camera);

  const orbitControls = initOrbitControls(camera, renderer1.domElement);

  function render() {
    orbitControls.update();
    renderer1.render(scene1, camera);
    renderer2.render(scene2, camera);
    requestAnimationFrame(render);
  }
  render();

  let result;

  const loader = new ObjectLoader();

  document.getElementById('save').addEventListener('click', () => {
    result = scene1.toJSON();
  });

  document.getElementById('load').addEventListener('click', () => {
    const res = loader.parse(result);
    console.log(res);
    scene2 = res;
  });

  const target = {
    camera,
    scene1,
    scene2,
  };

  window.target = target;
}
