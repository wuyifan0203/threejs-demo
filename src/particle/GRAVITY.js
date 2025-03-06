/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-06 17:06:24
 * @FilePath: \threejs-demo\src\particle\GRAVITY.js
 */
import {
  PointLight,
  PerspectiveCamera,
  BufferGeometry,
  PointsMaterial,
  AdditiveBlending,
  Points,
  MeshLambertMaterial,
  Float32BufferAttribute,
  AmbientLight,
} from 'three';
import { initRenderer, resize, initScene, initOrbitControls, initLoader, Model_Path } from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  let t = 0;
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000,
  );
  camera.position.set(0, 0, 120);
  camera.lookAt(0, 0, 0);
  const scene = initScene();
  renderer.setClearColor(0x000000);

  const light1 = new PointLight(0xffffff, 300);
  light1.position.set(-50, -50, 75);

  const light2 = new PointLight(0xffffff, 300);
  light2.position.set(50, 50, 75);

  const light3 = new PointLight(0xffffff, 300);
  light3.position.set(25, 50, 200);

  const ambientLight = new AmbientLight(0xffffff, 0.02);
  scene.add(light1, light2, light3, ambientLight);

  const controls = initOrbitControls(camera, renderer.domElement);
  const { updateParticles, updateModelMesh } = draw(scene, camera);
  resize(renderer, camera);

  function render() {
    controls.update();
    renderer.clear();
    renderer.render(scene, camera);
    updateParticles(camera, t);
    updateModelMesh(camera, t);
    t += 0.1;
    requestAnimationFrame(render);
  }
  render();

}
const random = (min, max) => min + Math.random() * (max - min);

function draw(scene, camera) {
  // particle
  const particleNum = 5000;
  const particleMaterial = new PointsMaterial({
    size: 1,
    color: 0xffffff,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    blending: AdditiveBlending,
  });

  const createParticleGeometry = () => {
    const geometry = new BufferGeometry();
    const vertex = [];
    for (let p = 0; p < particleNum; p++) {
      vertex.push(
        random(20, 30) * Math.cos(p),
        random(20, 30) * Math.sin(p),
        random(-1500, 0),
      );
    }
    geometry.setAttribute('position', new Float32BufferAttribute(vertex, 3));
    return geometry;
  };
  const particleGeometry = createParticleGeometry();

  const particleSystem = new Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // model
  const loader = initLoader();
  let modelMesh = null;

  const modelOnLoad = (mesh) => {
    modelMesh = mesh.scene;
    modelMesh.material = new MeshLambertMaterial();
    modelMesh.scale.set(0.0005, 0.0005, 0.0005);
    modelMesh.position.z = -10;
    scene.add(modelMesh);
  };
  const onError = (e) => {
    console.error('load resources fail !', e.stack);
  };

  loader.load(`../../${Model_Path}/astronaut.glb`, modelOnLoad, null, onError);

  const updateParticles = (camera) => {
    particleSystem.rotation.z += 0.015;
    const vertex = particleGeometry.getAttribute('position').array;
    for (let i = 0; i < vertex.length; i++) {
      if ((i + 1) % 3 === 0) {
        const dist = vertex[i] - camera.position.z;
        if (dist >= 0) vertex[i] = random(-1000, -500);
        vertex[i] += 2.5;
      }
    }
    const _vertices = new Float32BufferAttribute(vertex, 3);
    particleGeometry.attributes.position = _vertices;
  };
  const updateModelMesh = (camera, t) => {
    if (modelMesh) {
      modelMesh.position.z = 0.03 * Math.sin(t * 0.05) + (camera.position.z - 0.2);
      modelMesh.rotation.x += 0.01;
      modelMesh.rotation.y += 0.01;
      modelMesh.rotation.z += 0.01;
    }
  };

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = -1 * ((cx - e.clientX) / cx);
    const dy = -1 * ((cy - e.clientY) / cy);
    camera.position.x = dx * 5;
    camera.position.y = dy * 5;
    camera.updateProjectionMatrix();
    modelMesh.position.x = dx * 5;
    modelMesh.position.y = dy * 5;
  });

  return { updateParticles, updateModelMesh };
}
