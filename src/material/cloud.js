/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-09 17:45:30
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-09 18:18:14
 * @FilePath: \threejs-demo\src\material\cloud.JS
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  Vector3,
  Mesh,
  AmbientLight,
  BoxGeometry,
  PointLight,
  MeshStandardMaterial,
  NoBlending,
  NormalBlending,
  AdditiveBlending,
  SubtractiveBlending,
  MultiplyBlending,
  FrontSide,
  BackSide,
  DoubleSide,
  CanvasTexture,
  ClampToEdgeWrapping,
  RepeatWrapping,
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initCustomGrid,
  initOrbitControls,
  initGUI,
  initScene,
} from "../lib/tools/index.js";

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();

  const camera = initOrthographicCamera(new Vector3(100, 100, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const scene = initScene();
  initCustomGrid(scene);

  scene.add(new AmbientLight());

  // background
  const backgroundCanvas = document.createElement("canvas");
  const ctx = backgroundCanvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, backgroundCanvas.height);
  gradient.addColorStop(0, "#1e4877");
  gradient.addColorStop(0.5, "#4584b4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

  const texture = new CanvasTexture(backgroundCanvas);
  scene.background = texture;

  function render() {
    renderer.render(scene, camera);
    orbitControls.update();
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);

  const gui = initGUI();
}
