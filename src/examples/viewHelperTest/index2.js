/*
 * @Date: 2023-01-04 10:59:15
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-04 11:00:26
 * @FilePath: /aquaman/example/viewHelperTest/index2.js
 */
import * as THREE from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';

let mesh, renderer, scene, camera, controls, helper;

init();
animate();

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(20, 20, 20);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.center = controls.target;

  // ambient
  scene.add(new THREE.AmbientLight(0x222222));

  // light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(20, 20, 0);
  scene.add(light);

  // axes
  scene.add(new THREE.AxesHelper(20));

  // geometry
  const geometry = new THREE.SphereGeometry(5, 12, 8);

  // material
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    flatShading: true,
    transparent: true,
    opacity: 0.7
  });

  // mesh
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // helper
  helper = new ViewHelper(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);

  renderer.clear();

  renderer.render(scene, camera);

  helper.render(renderer);
}
