/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2023-11-21 16:26:11
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-12 09:37:45
 * @FilePath: \threejs-demo\src\lib\tools\common.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  WebGLRenderer,
  PCFSoftShadowMap,
  Color,
  PerspectiveCamera,
  Vector3,
  PlaneGeometry,
  MeshPhongMaterial,
  SpotLight,
  AmbientLight,
  Mesh,
  ArrowHelper,
  Group,
  OrthographicCamera,
  Scene,
  CanvasTexture,
  ClampToEdgeWrapping,
  DirectionalLight,
  Clock,
  MathUtils,
  Fog,
} from "three";
import { ViewHelper } from "three/examples/jsm/helpers/ViewHelper.js";
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { CoordinateHelper } from "../custom/CoordinateHelper.js";
import { CustomGrid } from "../custom/CustomGrid.js";
import { OmnipotentLoader } from "../custom/OmnipotentLoader.js";
import { Stats } from "../util/Stats.js";
import { GUI } from "../util/lil-gui.module.min.js";

/**
 * @description: 初始化渲染器
 * @param {object} props
 * @return {WebGLRenderer}
 */
function initRenderer(props = {}) {
  const dom = document.getElementById("webgl-output");
  dom.style.width = "100vw";
  dom.style.height = "100vh";

  const renderer = new WebGLRenderer({ antialias: true, ...props });
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(devicePixelRatio);

  renderer.setClearColor(new Color(0xffffff));
  renderer.setSize(dom.offsetWidth, dom.offsetHeight);

  dom.appendChild(renderer.domElement);
  window.renderer = renderer;

  return renderer;
}

/**
 * @description: 创建透视相机
 * @param {Vector3} initialPosition
 * @return {PerspectiveCamera}
 */
function initPerspectiveCamera(initialPosition) {
  const position =
    initialPosition !== undefined ? initialPosition : new Vector3(-30, 40, 30);

  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.copy(position);
  camera.lookAt(new Vector3(0, 0, 0));

  window.camera = camera;

  return camera;
}

/**
 * @description: 创建正交相机
 * @param {Vector3} initialPosition
 * @return {OrthographicCamera}
 */
function initOrthographicCamera(initialPosition) {
  const s = 15;
  const h = window.innerHeight;
  const w = window.innerWidth;
  const position =
    initialPosition !== undefined ? initialPosition : new Vector3(-30, 40, 30);

  const camera = new OrthographicCamera(
    -s,
    s,
    s * (h / w),
    -s * (h / w),
    1,
    10000
  );
  camera.position.copy(position);
  camera.lookAt(new Vector3(0, 0, 0));

  window.camera = camera;

  return camera;
}

/**
 * @description: 添加平面
 * @param {Scene} scene
 * @return {Mesh}
 */
function initGroundPlane(scene, size = { x: 200, y: 200 }) {
  const planeGeometry = new PlaneGeometry(size.x, size.y);
  const planeMaterial = new MeshPhongMaterial({ color: 0xd3d3d3 });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.name = "LargeGroundPlane";
  plane.receiveShadow = true;

  scene.add(plane);

  return plane;
}

/**
 * @description: 添加默认灯光
 * @param {Scene} scene
 * @param {Vector3} initialPosition
 * @return {SpotLight}
 */
function initSpotLight(color = 0xffffff, intensity = 1000) {
  const spotLight = new SpotLight(color, intensity);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.fov = 30;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.distance = 0;
  spotLight.penumbra = 0.05;
  spotLight.name = "spotLight";

  return spotLight;
}

function initAmbientLight(scene, color = 0xffffff, intensity = 1) {
  const ambientLight = new AmbientLight(color, intensity);
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);
  return ambientLight;
}

/**
 * @description: 添加坐标轴
 * @param {Scene} scene
 * @return {Group}
 */
function initAxesHelper(scene) {
  const arrowHelper = new Group();
  arrowHelper.name = "arrowHelper";

  ["X", "Y", "Z"].forEach((e) => {
    const pos = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] }[e];
    const size = { X: 1000 * 0.5, Y: 1000 * 0.5, Z: 1000 * 0.5 }[e];
    const color = { X: "red", Y: "green", Z: "blue" }[e];
    const arrowSize = size * 0.025;
    const arrow = new ArrowHelper(
      new Vector3(...pos),
      new Vector3(0, 0, 0),
      size,
      color,
      arrowSize,
      0.1 * arrowSize
    );
    arrowHelper.add(arrow);
  });
  arrowHelper.position.set(0, 0, 0);
  scene.add(arrowHelper);
  return arrowHelper;
}

/**
 * @description: 窗口自适应
 * @param {WebGLRenderer} render
 * @param {Camera} camera
 * @param {(w,h)=>void} callback (width,height)=>void
 * @return {void}
 */
function resize(render, cameras, callback = () => { }) {
  cameras = Array.isArray(cameras) ? cameras : [cameras];
  window.addEventListener("resize", () => {
    const [w, h] = [window.innerWidth, window.innerHeight];
    render.setSize(window.innerWidth, window.innerHeight);
    cameras.forEach((camera) => {
      if (camera.type === "OrthographicCamera") {
        camera.top = 15 * (h / w);
        camera.bottom = -15 * (h / w);
      } else if (camera.type === "PerspectiveCamera") {
        camera.aspect = window.innerWidth / window.innerHeight;
      }
      camera.updateProjectionMatrix();
    });
    callback(w, h);
  });
}

/**
 * @description: 添加网格
 * @param {Scene} scene
 * @param {number} width 默认50
 * @param {number} height 默认50
 * @return {CustomGrid}
 */
function initCustomGrid(scene, width = 50, height = 50, dx = 1, dy = 1) {
  const grid = new CustomGrid(width, height, dx, dy);
  grid.name = "grid";

  scene.add(grid);

  return grid;
}

function initOrbitControls(camera, container) {
  const controls = new OrbitControls(camera, container);
  window.controls = controls;
  return controls;
}

function initGUI(params) {
  return new GUI(params);
}
function initScene() {
  const scene = new Scene();
  window.scene = scene;
  return scene;
}

function initCoordinates(axesLength) {
  window.coordinateHelper = new CoordinateHelper(axesLength);
  return window.coordinateHelper;
}

function initDirectionLight(color = 0xffffff, intensity = 3) {
  const light = new DirectionalLight(color, intensity);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 200;
  light.shadow.camera.left = -50;
  light.shadow.camera.right = 50;
  light.shadow.camera.top = 50;
  light.shadow.camera.bottom = -50;
  return light;
}

function initProgress() {
  const main = document.createElement("div");
  main.style.position = "absolute";
  main.style.left = "50%";
  main.style.bottom = "20%";
  main.style.transform = "translateX(-50%)";

  const progress = document.createElement("progress");
  progress.max = 100;
  progress.min = 0;
  progress.style.width = "300px";
  progress.style.height = "20px";
  main.appendChild(progress);

  const value = document.createElement("span");
  value.style.marginLeft = "20px";
  main.appendChild(value);

  const label = document.createElement("div");
  label.style.textAlign = "center";
  label.innerText = "Loading...";
  main.appendChild(label);

  main.setText = function (text) {
    label.innerText = text;
  };

  main.setProgress = function (num) {
    progress.value = num;
    value.innerText = num + "%";
  };

  main.show = function () {
    main.style.display = "block";
  };

  main.hide = function () {
    main.style.display = "none";
  };

  return main;
}

function createBackgroundTexture(color, color2) {
  const canvas = document.createElement("canvas");
  canvas.width = window.screen.width;
  canvas.height = window.screen.height;
  const ctx = canvas.getContext("2d");

  return (function () {
    const gradient = ctx.createLinearGradient(0, 0, 0, window.screen.height);

    gradient.addColorStop(0.25, color2);
    gradient.addColorStop(1, color);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.screen.width, window.screen.height);

    // 1
    const texture = new CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
    return texture;
  })();
}

/**
 * @description: 用来展示FPS，内存等信息
 * @param {number} showPanel
 * @return {Stats}
 *
 * @example
 *
 * const status = initStats();
 *
 * function render() {
 *    // other code for render
 *    status.update();
 * }
 */
function initStats(showPanel = 0) {
  const stats = new Stats();
  stats.showPanel(showPanel);
  const dom = document.querySelector("#webgl-output");
  dom.appendChild(stats.dom);
  return stats;
}

function initViewHelper(camera, document) {
  const viewHelper = new ViewHelper(camera, document);
  return viewHelper;
}

function initTransformControls(camera, domElement) {
  return new TransformControls(camera, domElement);
}

/**
 * @description: init Clock
 * @return {Clock}
 */
function initClock() {
  return new Clock();
}
/**
 * @description: init Loader
 * @return {OmnipotentLoader}
 */
function initLoader(manager) {
  return new OmnipotentLoader(manager)
}

const defaultSkyParams = {
  turbidity: 0,
  rayleigh: 0.16,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
  elevation: 7,
  azimuth: 180,
};

const sun = new Vector3();
/**
 * @description: init Sky Mesh
 * @param {*} params =  {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
};
 * @return {Sky}
 */
function initSky(scene, params = {}) {
  const mergedParams = Object.assign({}, defaultSkyParams, params);

  const sky = new Sky();
  const uniforms = sky.material.uniforms;

  sky.scale.setScalar(450000);
  scene.add(sky);
  sky.name = "sky";

  sky.update = function (params = defaultSkyParams) {
    Object.keys(mergedParams).forEach((key) => {
      if (Object.hasOwn(uniforms, key)) {
        sky.material.uniforms[key].value = mergedParams[key];
      }
    });
    const phi = MathUtils.degToRad(90 - params.elevation);
    const theta = MathUtils.degToRad(params.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(sun);
  };
  sky.update(mergedParams);

  return sky;
}

function initFog(scene, near = 0.01, far = 500, color = '#ffffff') {
  const fog = new Fog(color, near, far);
  scene.fog = fog;
}


async function loadJSON(filePath) {
  try {
    const response = await fetch(filePath);

    // 检查HTTP响应状态
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    // 解析JSON数据
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('加载JSON失败:', error);
    throw error; // 可选：将错误传递给调用方
  }
}

export {
  initAxesHelper,
  initSpotLight,
  initGroundPlane,
  initPerspectiveCamera,
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initOrbitControls,
  initGUI,
  initScene,
  resize,
  initCoordinates,
  initProgress,
  createBackgroundTexture,
  initDirectionLight,
  initAmbientLight,
  initStats,
  initViewHelper,
  initTransformControls,
  initClock,
  initSky,
  initLoader,
  initFog,
  loadJSON
};
