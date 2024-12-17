/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-23 16:05:22
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-09-12 14:41:14
 * @FilePath: /threejs-demo/src/geometry/lathePolygon.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Vector3,
  Mesh,
  MeshNormalMaterial,
  Vector2,
  LatheGeometry,
  BufferGeometry,
  Float32BufferAttribute,
} from 'three';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
  initGUI,
  initOrbitControls,
  initScene,
  vec2ToVec3
} from '../lib/tools/index.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { VertexNormalsHelper } from '../lib/three/VertexNormalsHelper.js';

const { compile, isComplex } = math;

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(-15, 15, 15));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  resize(renderer, camera);

  initAxesHelper(scene);
  const grid = initCustomGrid(scene);
  grid.rotateX(Math.PI / 2);

  const controls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  draw(scene);

  (function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    requestAnimationFrame(render);
  })();

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
    drawFunc: 1,
    segment: 12,
    phiLength: Math.PI * 0.5,
  };

  const geometryParams = {
    xMin: -25,
    xMax: 25,
    yMin: -25,
    yMax: 10,
    resolution: 200,
  };

  function round(num, bit = 14) {
    return Number(num.toFixed(bit));
  }

  function getFormulaPoints() {
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


  const getOptions = () => {
    const options = {};
    funcList.forEach((key, i) => {
      options[key] = i;
    });
    return options;
  };

  const normalMesh = new Mesh(new BufferGeometry(), new MeshNormalMaterial());
  let normalHelper = null;
  const mesh = new Mesh(new BufferGeometry(), material);
  update();

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

  const materialFolder = gui.addFolder('Material');
  materialFolder.add(material, 'wireframe');

  const helperFolder = gui.addFolder('Helper');
  helperFolder.add(normalHelper, 'visible').name('normal');



  function update() {
    mesh.geometry.dispose();
    const points = getFormulaPoints();
    mesh.geometry = new LatheGeometry(points, controls.segment, 0, controls.phiLength);

    const geometry = new BufferGeometry().setFromPoints(vec2ToVec3(points, 0))
    geometry.setAttribute('normal', new Float32BufferAttribute(calcPreNormal(points), 3));

    normalMesh.geometry.dispose();
    normalMesh.geometry = geometry;
    normalHelper && scene.remove(normalHelper);
    normalHelper = new VertexNormalsHelper(normalMesh);
    normalHelper.visible = false;
    scene.add(normalHelper);
  }

  function calcPreNormal(points) {
    const initNormals = [];
    const normal = new Vector3();
    const curNormal = new Vector3();
    const prevNormal = new Vector3();
    let dx = 0;
    let dy = 0;
    for (let j = 0; j <= (points.length - 1); j++) {
      switch (j) {
        case 0:				// special handling for 1st vertex on path
          dx = points[j + 1].x - points[j].x;
          dy = points[j + 1].y - points[j].y;

          normal.x = dy * 1.0;
          normal.y = - dx;
          normal.z = dy * 0.0;

          prevNormal.copy(normal);
          normal.normalize();
          initNormals.push(normal.x, normal.y, normal.z);
          break;

        case (points.length - 1):	// special handling for last Vertex on path
          initNormals.push(prevNormal.x, prevNormal.y, prevNormal.z);
          break;
        default:			// default handling for all vertices in between
          dx = points[j + 1].x - points[j].x;
          dy = points[j + 1].y - points[j].y;
          normal.x = dy * 1.0;
          normal.y = - dx;
          normal.z = dy * 0.0;

          curNormal.copy(normal);

          normal.x += prevNormal.x;
          normal.y += prevNormal.y;
          normal.z += prevNormal.z;

          normal.normalize();
          initNormals.push(normal.x, normal.y, normal.z);
          prevNormal.copy(curNormal);
      }
    }

    return initNormals
  }

  scene.add(mesh);
}
