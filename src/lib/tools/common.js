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
  DirectionalLight
} from '../three/three.module.js';
import { CustomGrid } from '../three/customGrid.js';
import { OrbitControls } from '../three/OrbitControls.js';
import { GUI } from '../util/lil-gui.module.min.js'
import { CoordinateHelper } from '../three/CoordinateHelper.js';

/**
 * @description: 初始化渲染器
 * @param {object} props
 * @return {WebGLRenderer}
 */
function initRenderer(props = {}) {
  const renderer = new WebGLRenderer({ antialias: true, ...props });
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(devicePixelRatio);

  renderer.setClearColor(new Color(0xffffff));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('webgl-output').appendChild(renderer.domElement);

  window.renderer = renderer;

  return renderer;
}

/**
 * @description: 创建透视相机
 * @param {Vector3} initialPosition
 * @return {PerspectiveCamera}
 */
function initPerspectiveCamera(initialPosition) {
  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(-30, 40, 30);

  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
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
  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(-30, 40, 30);

  const camera = new OrthographicCamera(-s, s, s * (h / w), -s * (h / w), 1, 10000);
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
  plane.name = 'LargeGroundPlane';
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
function initDefaultLighting(scene, initialPosition, color = 0x343434) {
  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(100, 300, 400);

  const spotLight = new SpotLight(0xffffff);
  spotLight.position.copy(position);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.fov = 15;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.05;
  spotLight.name = 'spotLight';

  scene.add(spotLight);

  const ambientLight = new AmbientLight(color);
  ambientLight.name = 'ambientLight';
  scene.add(ambientLight);

  return spotLight;
}

/**
 * @description: 添加坐标轴
 * @param {Scene} scene
 * @return {Group}
 */
function initAxesHelper(scene) {
  const arrowHelper = new Group();
  arrowHelper.name = 'arrowHelper';

  ['X', 'Y', 'Z'].forEach((e) => {
    const pos = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] }[e];
    const size = { X: 1000 * 0.5, Y: 1000 * 0.5, Z: 1000 * 0.5 }[e];
    const color = { X: 'red', Y: 'green', Z: 'blue' }[e];
    const arrowSize = (size) * 0.025;
    const arrow = new ArrowHelper(new Vector3(...pos), new Vector3(0, 0, 0), size, color, arrowSize, 0.1 * arrowSize);
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
 * @return {void}
 */
function resize(render, camera) {
  window.addEventListener('resize', () => {
    const [w, h] = [window.innerWidth, window.innerHeight];
    render.setSize(window.innerWidth, window.innerHeight);
    if (camera.type === 'OrthographicCamera') {
      camera.top = 15 * (h / w);
      camera.bottom = -15 * (h / w);
    } else if (camera.type === 'PerspectiveCamera') {
      camera.aspect = window.innerWidth / window.innerHeight;
    }
    camera.updateProjectionMatrix();
  });
}

/**
 * @description: 添加网格
 * @param {Scene} scene
 * @param {number} width 默认50
 * @param {number} height 默认50
 * @return {CustomGrid}
 */
function initCustomGrid(scene, width = 50, height = 50) {
  const grid = new CustomGrid(width, height, 1, 1);
  grid.name = 'grid';

  scene.add(grid);

  return grid;
}

function initOrbitControls(camera, container) {
  const controls = new OrbitControls(camera, container);
  window.controls = controls;
  return controls;
}

function initGUI() {
  return new GUI()
}
function initScene() {
  const scene = new Scene();
  window.scene = scene
  return scene;
}

function initCoordinates(axesLength) {
  return new CoordinateHelper(axesLength)
}

function initDirectionLight(color = 0xffffff, intensity = 3) {
  const light = new DirectionalLight(color, intensity);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 10000;
  return light;
}

function initProgress() {

  const main = document.createElement('div');
  main.style.position = 'absolute';
  main.style.left = '50%';
  main.style.bottom = '20%';
  main.style.transform = 'translateX(-50%)';

  const progress = document.createElement('progress');
  progress.max = 100;
  progress.min = 0;
  progress.style.width = '300px';
  progress.style.height = '20px';
  main.appendChild(progress)

  const value = document.createElement('span');
  value.style.marginLeft = '20px';
  main.appendChild(value);

  const label = document.createElement('div');
  label.style.textAlign = 'center';
  label.innerText = 'Loading...';
  main.appendChild(label);


  main.setText = function (text) {
    label.innerText = text;
  };

  main.setProgress = function (num) {
    progress.value = num;
    value.innerText = num + '%';
  }


  main.show = function () {
    main.style.display = 'block';
  }

  main.hide = function () {
    main.style.display = 'none';
  }


  return main

}

function createBackgroundTexture(color, color2) {
  const canvas = document.createElement('canvas');
  canvas.width = window.screen.width;
  canvas.height = window.screen.height;
  const ctx = canvas.getContext('2d');

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

export {
  initAxesHelper,
  initDefaultLighting,
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
  initDirectionLight
};
