/*
 * @Date: 2023-01-04 10:59:15
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 16:30:50
 * @FilePath: /threejs-demo/src/helper/viewHelperTest.js
 */
import * as THREE from 'three';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

let mesh; let renderer; let scene; let camera; let controls; let
  helper;

init();
render();

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = false; // 1
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
  const light = new THREE.DirectionalLight(0xffffff, 3);
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
    opacity: 0.7,
  });

  // mesh
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // helper
  helper = new ViewHelper(camera, renderer.domElement);
}

function render() {
  requestAnimationFrame(render);

  renderer.clear(); // 2

  renderer.render(scene, camera);

  helper.render(renderer); // 3
}
