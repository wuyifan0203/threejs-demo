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
  OrthographicCamera
} from '../three/three.module.js';
import { CustomGrid } from '../three/customGrid.js';

/**
 * @description: 初始化渲染器
 * @param {object} props
 * @return {WebGLRenderer}
 */
function initRenderer(props = {}) {
  const renderer = new WebGLRenderer(Object.assign({antialias: true},props));
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  renderer.setClearColor(new Color(0x000000));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('webgl-output').appendChild(renderer.domElement);

  return renderer;
}

/**
 * @description: 创建透视相机
 * @param {Vector3} initialPosition
 * @return {PerspectiveCamera}
 */
function initPerspectiveCamera(initialPosition) {
  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(-30, 40, 30);

  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
  camera.position.copy(position);
  camera.lookAt(new Vector3(0, 0, 0));

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

  const camera = new OrthographicCamera(-s, s, s * (h / w), -s * (h / w), 1, 10000000);
  camera.position.copy(position);
  camera.lookAt(new Vector3(0, 0, 0));

  return camera;
}

/**
 * @description: 添加平面
 * @param {Scene} scene
 * @return {Mesh}
 */
function addLargeGroundPlane(scene) {
  const planeGeometry = new PlaneGeometry(100, 100);
  const planeMaterial = new MeshPhongMaterial({
    color: 0xffffff
  });
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
function initDefaultLighting(scene, initialPosition) {
  var position = (initialPosition !== undefined) ? initialPosition : new Vector3(100, 300, 400);

  var spotLight = new SpotLight(0xffffff);
  spotLight.position.copy(position);
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.fov = 15;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.05;
  spotLight.name = 'spotLight';

  scene.add(spotLight);

  const ambientLight = new AmbientLight(0x343434);
  ambientLight.name = 'ambientLight';
  scene.add(ambientLight);

  return spotLight;
}

/**
 * @description: 添加坐标轴
 * @param {Scene} scene
 * @return {Group}
 */
function createAxesHelper(scene) {
  const arrowHelper = new Group();
  arrowHelper.name = 'arrowHelper';

  ['X', 'Y', 'Z'].forEach(e => {
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
      camera.bottom =  - 15 * (h / w);
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

export {
  createAxesHelper,
  initDefaultLighting,
  addLargeGroundPlane,
  initPerspectiveCamera,
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  resize
};
