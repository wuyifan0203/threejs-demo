/*
 * @Date: 2023-01-30 14:03:05
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-05 09:36:12
 * @FilePath: /threejs-demo/examples/src/light/box.js
 */
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initGroundPlane,
  resize,
} from '../lib/tools/index.js';
import {
  Scene,
  Vector3,
  Mesh,
  MeshLambertMaterial,
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  BufferAttribute,
  DirectionalLight,
  PlaneGeometry,
} from '../lib/three/three.module.js';

const init = () => {
  const renderer = initRenderer();
  // 1
  renderer.shadowMap.enabled = true;
  const camera = initPerspectiveCamera(new Vector3(20, 20, 20));
  camera.up.set(0, 0, 1);

  const scene = new Scene();
  initAxesHelper(scene);
  const ambientLight = new AmbientLight(0x3c3c3c);
  scene.add(ambientLight);

  const groundPlane = initGroundPlane(scene);
  groundPlane.position.set(0, 0, -3);
  groundPlane.rotation.z = -0.5 * Math.PI;
  // 2
  groundPlane.receiveShadow = true;

  const directionalLight = new DirectionalLight('#ffffff', 1);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  directionalLight.position.set(5, 5, 5);

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);
  resize(renderer, camera);

  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
  render();

  window.camera = camera;
  window.scene = scene;
};

function draw(scene) {
  const material = new MeshLambertMaterial({ color: '#516000' });
  const material1 = new MeshLambertMaterial({ color: 0x516099 });

  const demoMesh = new Mesh(
    new BoxGeometry(2, 2, 2),
    new MeshLambertMaterial({ color: '#516099' }),
  );

  demoMesh.position.set(5, 0, 0);
  demoMesh.castShadow = true;

  scene.add(demoMesh);

  const geometry = new BufferGeometry();
  const geometry1 = new BufferGeometry();
  const mesh = new Mesh(geometry, material);
  const mesh1 = new Mesh(geometry1, material1);
  mesh.castShadow = true;
  mesh1.castShadow = true;

  mesh1.position.set(-5, 0, 0);
  //    7-----6
  //   /|    /|
  //  4-----5 |
  //  | |   | |
  //  | 1---|-2
  //  |/    |/
  //  0-----3

  const position = [
    -1, -1, -1, -1, 1, -1, // v0  v1
    1, 1, -1, 1, -1, -1, // v2  v3
    -1, -1, 1, 1, -1, 1, // v4  v5
    1, 1, 1, -1, 1, 1, // v6  v7
  ];

  const index = [
    0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, //  down up
    1, 0, 4, 4, 7, 1, 2, 6, 5, 5, 3, 2, // left right
    0, 3, 5, 5, 4, 0, 1, 7, 6, 6, 2, 1, // front back
  ];

  const position1 = [
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, // v4-v7-v6-v5 back
  ];

  const index1 = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23, // back
  ];

  const normal1 = [
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, // v4-v7-v6-v5 back
  ];

  geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
  geometry.setIndex(index);
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normal1), 3));

  geometry1.setAttribute('position', new BufferAttribute(new Float32Array(position1), 3));
  geometry1.setIndex(index1);
  geometry1.setAttribute('normal', new BufferAttribute(new Float32Array(normal1), 3));

  //   scene.add(mesh);
  //   scene.add(mesh1);

  //  0----1----3
  //   \   |   /
  //     \ | /
  //       2

  const plane = new BufferGeometry();

  const position3 = [
    -2, 0, 0,
    0, 0, 2,
    0, 2, 0,
    2, 0, 0,
    0, 2, 0,
    0, 0, 2,
  ];

  const index2 = [
    1, 2, 0,
    3, 4, 5,
  ];

  const normal3 = [
    -0.866, 0.866, 0.866,
    -0.866, 0.866, 0.866,
    -0.866, 0.866, 0.866,
    0.866, 0.866, 0.866,
    0.866, 0.866, 0.866,
    0.866, 0.866, 0.866,
  ];

  plane.setAttribute('position', new BufferAttribute(new Float32Array(position3), 3));
  plane.setAttribute('normal', new BufferAttribute(new Float32Array(normal3), 3));
  plane.setIndex(index2);

  demoMesh.visible = false;

  const p0 = new Vector3(0, 0, -1);
  const p1 = new Vector3(0, 0, 2);
  const p2 = new Vector3(0, 2, 0);
  const p3 = new Vector3(1, 0, 0);

  const v10 = new Vector3().subVectors(p0, p1);
  const v12 = new Vector3().subVectors(p2, p1);
  const v13 = new Vector3().subVectors(p3, p1);

  const n1 = new Vector3().crossVectors(v10, v12).normalize().toArray();
  const n2 = new Vector3().crossVectors(v13, v12).normalize().toArray();
  console.log(n1, n2);

  const plane1 = new PlaneGeometry(3, 3, 2, 1);

  const props = {
    wireframe: true,
    color: 'skyblue',
  };

  const planeMesh1 = new Mesh(plane1, new MeshLambertMaterial(props));

  console.log(plane1);

  scene.add(planeMesh1);
}

window.onload = () => {
  init();
};
