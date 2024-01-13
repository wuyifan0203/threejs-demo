/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-13 15:38:40
 * @FilePath: /threejs-demo/src/particle/geometry.js
 */
import {
  SphereGeometry,
  PerspectiveCamera,
  PointsMaterial,
  AdditiveBlending,
  Points,
  Texture,
} from '../lib/three/three.module.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import {
  initRenderer, resize, angle2Radians, initGUI, initStats
} from '../lib/tools/index.js';


window.onload = () => {
  init();
};

let autoScale = false;
let s = 0;
let last = Date.now(); // Last time that this function was called
const ANGLE_STEP = 100.0; // Rotation angle (degrees/second)
function animate(angle) {
  const now = Date.now(); // Calculate the elapsed time
  const elapsed = now - last;
  last = now;
  const newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

function init() {
  const renderer = initRenderer();

  const stats = initStats();
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(3, 3, 63);
  camera.lookAt(10, 0, 0);
  const scene = initScene();
  renderer.setClearColor(0x000000);

  const controls = new OrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);
  const { mesh } = draw(scene, renderer);
  resize(renderer, camera);

  render();
  function render() {
    stats.begin();
    controls.update();
    renderer.clear();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    if (autoScale) {
      s = animate(s);
      const scale = Math.sin(angle2Radians(s));
      mesh.scale.set(scale, scale, scale);
    }
    stats.end();
  }

  renderer.setAnimationLoop(render);

}

function draw(scene, renderer) {
  const canvas = createCanvasTexture();

  const material = new PointsMaterial({
    size: 3,
    color: 0xffffff,
    map: canvas,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    blending: AdditiveBlending,
  });
  const geometry = new SphereGeometry(16, 16, 16);
  const mesh = new Points(geometry, material);
  scene.add(mesh);

  const controls = {
    radius: 16,
    widthSegments: 16,
    heightSegments: 16,
    background: '#000000',
    size: material.size,
    autoScale,
  };

  function createCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(0.4, 'rgba(0, 120, 20, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // GUI

  const gui = initGUI();
  const geometryFolder = gui.addFolder('Geometry');
  geometryFolder.open();
  geometryFolder.add(controls, 'radius', 1, 64, 0.1).onChange(() => {
    updateGeometry();
  });
  geometryFolder.add(controls, 'widthSegments', 1, 64, 1).onChange(() => {
    updateGeometry();
  });
  geometryFolder.add(controls, 'heightSegments', 1, 64, 1).onChange(() => {
    updateGeometry();
  });
  const materialFolder = gui.addFolder('Material');
  materialFolder.open();
  materialFolder.add(controls, 'size', 1, 30, 0.1).onChange((e) => {
    material.size = e;
  });
  gui.addColor(controls, 'background').onChange((e) => {
    renderer.setClearColor(e);
  });
  gui.add(controls, 'autoScale').onChange((e) => {
    autoScale = e;
  });

  function updateGeometry() {
    mesh.geometry.dispose();
    mesh.geometry = new SphereGeometry(controls.radius, controls.widthSegments, controls.heightSegments);
  }

  return { mesh };
}
