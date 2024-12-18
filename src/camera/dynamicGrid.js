/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2023-11-21 16:26:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 13:24:24
 * @FilePath: /threejs-demo/src/camera/dynamicGrid.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  Mesh,
  Color,
  BoxGeometry,
  Vector3,
  MeshNormalMaterial,
  RingGeometry,
} from 'three';
import { DynamicGrid } from '../lib/custom/GridHelper2.js';
import {
  initRenderer,
  resize,
  initOrthographicCamera,
  initScene,
  initOrbitControls,
  initStats,
  initGUI,
  initCustomGrid
} from '../lib/tools/index.js';


window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const stats = new initStats();

  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  camera.up.set(0, 0, 1);

  const scene = initScene();
  scene.background = new Color(0xf0f0f0);

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  orbitControls.enableRotate = false;
  resize(renderer, camera);

  let customGrid = new DynamicGrid(50, 1);
  customGrid.rotateX(Math.PI / 2);
  scene.add(customGrid);


  const defaultGrid = initCustomGrid(scene, 100, 100);
  defaultGrid.visible = false;

  const material = new MeshNormalMaterial();

  const boxMesh = new Mesh(new BoxGeometry(4, 4, 1), material);
  scene.add(boxMesh);
  boxMesh.position.set(-3, -3, 0);

  const ringMesh = new Mesh(new RingGeometry(2, 4, 64), material);
  scene.add(ringMesh);
  ringMesh.position.set(3, 3, 0);

  (function render() {
    stats.begin();
    orbitControls.update();
    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(render);
  })();


  const dom = document.querySelector('#webgl-output');
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 100;
  canvas.style.position = 'fixed';
  canvas.style.bottom = '50px';
  const ctx = canvas.getContext('2d');
  dom.append(canvas);
  ctx.font = '15px serif';

  orbitControls.addEventListener('change', () => {
    customGrid.update(orbitControls.target, camera, dom);
    updateUnit(ctx, customGrid.unit, customGrid.gridUnit);
  });

  const options = {
    disabled: false
  }

  const gui = initGUI();
  gui.add(options, 'disabled').onChange(() => {
    customGrid.visible = !options.disabled;
    defaultGrid.visible = options.disabled;
  })
}

function updateUnit(ctx, unit, gridUnit) {
  unit = unit * gridUnit;
  ctx.clearRect(0, 0, 300, 100);
  ctx.beginPath();
  ctx.moveTo(20, 20);
  ctx.lineTo(20 + unit, 20);
  ctx.lineTo(20 + unit, 30);
  ctx.lineTo(20, 30);
  ctx.lineTo(20, 20);
  ctx.fillStyle = '#808080';
  ctx.fill();
  ctx.strokeRect(20 + unit, 21, unit, 8);
  ctx.strokeStyle = '#808080';
  ctx.closePath();
  gridUnit = parseFloat(gridUnit > 1 ? gridUnit.toFixed(1) : gridUnit.toFixed(10));
  ctx.fillText(`${gridUnit} um`, 20, 10);
}

