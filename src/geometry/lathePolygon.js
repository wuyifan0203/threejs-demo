/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-23 16:05:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 17:16:50
 * @FilePath: /threejs-demo/src/geometry/lathePolygon.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Vector3,
  Mesh,
  MeshNormalMaterial,
  Vector2,
  LatheGeometry,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
  initGUI,
  initOrbitControls,
  initScene
} from '../lib/tools/index.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

const { compile, isComplex } = math;

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initCustomGrid(scene);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  draw(scene);

  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  renderer.setAnimationLoop(render);
}

function draw(scene) {
  const material = new MeshNormalMaterial({
    depthTest: true,
    side: 2,
  });

  const funcList = [
    '2x+1',
    '2 * sin(x)',
    'x^2+1',
    'sqrt(0.8^2-(x-0.8)^2)',
    '-0.189 * (11.92 - x)^1.15 + 7.5',
  ];

  const controls = {
    drawFunc: 0,
    segment: 12,
    phiLength: Math.PI * 2,
  };

  const geometryParams = {
    xMin: -25,
    xMax: 25,
    yMin: -25,
    yMax: 25,
    resolution: 200,
  };

  function round(num, bit = 14) {
    return Number(num.toFixed(bit));
  }

  function getFormularPoints() {
    const {
      xMax, xMin, yMax, yMin, resolution,
    } = geometryParams;
    const { drawFunc } = controls;
    const delta = (xMax - xMin) / resolution;
    const funcCompile1 = compile(funcList[drawFunc]);
    const getY = computeFunc(funcCompile1, yMin, yMax);
    const positive = [];
    for (let index = 0, length = resolution; index < length; index++) {
      const x = round(xMin + index * delta);
      const y = getY(x);
      if (!isComplex(y)) {
        positive.push(new Vector2(x, y));
      }
    }
    return positive;
  }

  function computeFunc(funcCompile, yMin, yMax) {
    return (x) => {
      let y = funcCompile.evaluate({ x });
      if (y > yMax) {
        y = yMax;
      } else if (y < yMin) {
        y = yMin;
      }
      return y;
    };
  }

  const latheGeometry = new LatheGeometry(getFormularPoints(), controls.segment, 0, controls.phiLength);

  const getOptions = () => {
    const options = {};
    funcList.forEach((key, i) => {
      options[key] = i;
    });
    return options;
  };

  const mesh = new Mesh(latheGeometry, material);

  const gui = initGUI();
  gui.width = 350;
  const rangeSettingFolder = gui.addFolder('Range Setting');
  rangeSettingFolder.add(geometryParams, 'xMin', -25, 10, 0.01).onChange(() => update());
  rangeSettingFolder.add(geometryParams, 'xMax', -10, 25, 0.01).onChange(() => update());
  rangeSettingFolder.add(geometryParams, 'yMin', -25, 10, 0.1).onChange(() => update());
  rangeSettingFolder.add(geometryParams, 'yMax', -10, 25, 0.1).onChange(() => update());
  rangeSettingFolder.add(geometryParams, 'resolution', [10, 20, 50, 100, 200, 500]).onChange(() => update());

  const settingFolder = gui.addFolder('Setting');
  settingFolder.add(controls, 'drawFunc', getOptions()).onChange(() => update());

  const geometryFolder = gui.addFolder('Geometry');
  geometryFolder.add(controls, 'segment', 1, 36, 1).onChange(() => update());
  geometryFolder.add(controls, 'phiLength', 0, Math.PI * 2, 0.01).onChange(() => update());

  function update() {
    mesh.geometry.dispose();
    mesh.geometry = new LatheGeometry(getFormularPoints(), controls.segment, 0, controls.phiLength);
  }

  scene.add(mesh);
}
