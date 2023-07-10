import {
  Scene,
  PerspectiveCamera,
  PointLight,
  Mesh,
  Color,
  BoxGeometry,
  MeshLambertMaterial,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { initRenderer, resize } from '../../lib/tools/index.js';
import { GUI } from '../../lib/util/lil-gui.module.min.js';

import { Stats } from '../../lib/util/Stats.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const stats = new Stats();
  stats.showPanel(0);
  document.getElementById('webgl-output').append(stats.dom);
  const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.set(0, 0, 10);
  camera.layers.enable(0);
  camera.layers.enable(1);
  camera.layers.enable(2);

  const light = new PointLight(0xffffff, 1);
  light.layers.enable(0);
  light.layers.enable(1);
  light.layers.enable(2);

  camera.add(light);
  const scene = new Scene();
  scene.background = new Color(0xf0f0f0);
  scene.add(camera);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  resize(renderer, camera);

  function render() {
    stats.begin();
    orbitControls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    stats.end();
  }
  render();
  window.camera = camera;
  window.scene = scene;

  const redMaterial = new MeshLambertMaterial({ color: 'red' });
  const greenMaterial = new MeshLambertMaterial({ color: 'green' });
  const blueMaterial = new MeshLambertMaterial({ color: 'blue' });

  const geometry = new BoxGeometry(20, 20, 20);

  const mlist = [redMaterial, greenMaterial, blueMaterial];

  for (let i = 0; i < 500; i++) {
    const index = i % 3;
    const mesh = new Mesh(geometry, mlist[index]);
    mesh.scale.x = Math.random() + 0.5;
    mesh.scale.y = Math.random() + 0.5;
    mesh.scale.z = Math.random() + 0.5;
    mesh.position.x = Math.random() * 800 - 400;
    mesh.position.y = Math.random() * 800 - 400;
    mesh.position.z = Math.random() * 800 - 400;
    mesh.rotation.x = Math.random() * 2 * Math.PI;
    mesh.rotation.y = Math.random() * 2 * Math.PI;
    mesh.rotation.z = Math.random() * 2 * Math.PI;
    mesh.layers.set(index);
    scene.add(mesh);
  }

  const layers = {

    'toggle red': function () {
      camera.layers.toggle(0);
    },

    'toggle green': function () {
      camera.layers.toggle(1);
    },

    'toggle blue': function () {
      camera.layers.toggle(2);
    },

    'enable all': function () {
      camera.layers.enableAll();
    },

    'disable all': function () {
      camera.layers.disableAll();
    },

  };

  //
  // Init gui
  const gui = new GUI();
  gui.add(layers, 'toggle red');
  gui.add(layers, 'toggle green');
  gui.add(layers, 'toggle blue');
  gui.add(layers, 'enable all');
  gui.add(layers, 'disable all');
}
