/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-05-15 16:44:13
 * @FilePath: /threejs-demo/packages/examples/zFighting/layerTest.js
 */
import {
  Scene,
  PerspectiveCamera,
  PointLight,
  Mesh,
  Color,
  BoxGeometry,
  AmbientLight,
  MeshBasicMaterial,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import { initRenderer, resize, } from '../lib/tools/index.js';
import { Stats } from '../lib/util/Stats.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const stats = new Stats();
  stats.showPanel(0);
  document.getElementById('webgl-output').append(stats.dom);
  const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
  camera.up.set(0, 0, 1);
  camera.position.set(20, 20, 20);

  const light = new PointLight(0xffffff, 1);

  const scene = new Scene();
  scene.background = new Color(0xf0f0f0);
  camera.add(light);
  const ambientLight = new AmbientLight(0xffffff);
  scene.add(ambientLight);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  resize(renderer, camera);

  function render() {
    stats.begin();
    orbitControls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    light.position.copy(camera.position);
    stats.end();
  }
  render();
  window.camera = camera;
  window.scene = scene;

  const lineMaterial = new LineBasicMaterial({ color: 'black' });

  const redMaterial = new MeshBasicMaterial({
    color: 'red',
    transparent: true,
    opacity: 0.6,
  });
  const greenMaterial = new MeshBasicMaterial({ color: 'green' });
  const blueMaterial = new MeshBasicMaterial({
    color: 'blue',
    transparent: true,
    opacity: 0.6,
  });

  const geometry = new BoxGeometry(1, 1, 1);

  const mesh = new Mesh(geometry, redMaterial);
  const createEdge = (g) => new LineSegments(new EdgesGeometry(g), lineMaterial);
  mesh.scale.set(10, 10, 3);
  mesh.add(createEdge(geometry));
  const mesh3 = mesh.clone();
  scene.add(mesh);

  const mesh2 = new Mesh(geometry, blueMaterial);
  mesh2.scale.set(10, 10, 0.2);
  mesh2.add(createEdge(geometry));
  mesh2.position.set(0, 0, 1.6);
  scene.add(mesh2);

  mesh3.position.set(0, 0, 3.2);
  scene.add(mesh3);

  const mesh4 = new Mesh(geometry, greenMaterial);
  mesh4.add(createEdge(geometry));
  mesh4.scale.set(3, 1, 1);
  mesh4.position.set(0, 0, 2.3);
  scene.add(mesh4);
  mesh4.renderOrder = 2;
}
