/* eslint-disable no-unused-vars */
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import {
  initRenderer,
  initOrthographicCamera,
  initAxesHelper,
  // initGroundPlane,
  // initCamera,
  resize,
} from '../../lib/tools/index.js';
import {
  Scene,
  Vector3,
  Mesh,
  BufferGeometry,
  BoxBufferGeometry,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  DirectionalLight,
  PointLight,
  SpotLight,
  RectAreaLight,
  DirectionalLightHelper,
  AmbientLight,
  PointLightHelper,
  SpotLightHelper,
  OrthographicCamera,
  BufferAttribute,
} from '../../lib/three/three.module.js';

let scene;
const params = {
  opacity: 1,
  depthTest: true,
  depthWrite: true,
  alphaTest: 0,
};

const materialList = {
  basic: new MeshBasicMaterial(params),
  lambert: new MeshLambertMaterial(params),
  matcap: new MeshMatcapMaterial(params),
  phong: new MeshPhongMaterial(params),
  physical: new MeshPhysicalMaterial(params),
};

const directionalLight = new DirectionalLight();
const pointLight = new PointLight();
const spotLight = new SpotLight(0xffffff, 1);
const rectAreaLight = new RectAreaLight();

const lightList = {
  directional: {
    light: directionalLight,
    helper: new DirectionalLightHelper(directionalLight, 5),
  },
  point: {
    light: pointLight,
    helper: new PointLightHelper(pointLight, 1),
  },
  spot: {
    light: spotLight,
    helper: new SpotLightHelper(spotLight),
  },
  rectArea: {
    light: rectAreaLight,
    // helper: new SpotLightHelper(rectAreaLight)
  },
};

const materialSelect = document.querySelector('#material');
const lightSelect = document.querySelector('#light');

let materialValue = 'lambert';
let lightValue = 'directional';

const setLight = () => {
  const newLight = lightList[lightValue].light;
  newLight.name = 'light';
  const newHelper = lightList[lightValue]?.helper;
  newHelper && (newHelper.name = 'helper');
  newHelper && scene.add(newHelper);
  scene.add(newLight);
  newLight.position.set(50, 50, 50);
  newLight.lookAt(0, 0, 0);
  newLight.castShadow = true;

  newLight.shadow.mapSize.width = 2048;
  newLight.shadow.mapSize.height = 2048;

  if (lightValue === 'spot') {
    // spotLight.penumbra = 0.2;
    // spotLight.decay = 2;
    // spotLight.distance = 50;
  } else if (lightValue === 'directional') {
    // newLight.target = box;
  }
};
let camera;

const init = () => {
  const renderer = initRenderer();

  const cameraPosition = new Vector3(1000, 1000, 1000);
  // camera = initCamera();
  camera = initOrthographicCamera(cameraPosition);
  // camera = initReflectOrthographicCamera(cameraPosition);
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  scene = new Scene();
  initAxesHelper(scene);
  const light = new AmbientLight();
  scene.add(light);

  // const groundPlane = initGroundPlane(scene);
  // groundPlane.position.set(0, 0, 0);
  // groundPlane.rotation.z = -0.5 * Math.PI;

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    const light = scene.getObjectByName('light');
    const { x, y, z } = camera.position;
    light.position.set(x + 50, y + 50, z + 50);
  }
};

materialSelect.addEventListener('change', () => {
  materialValue = materialSelect.value;
  const box = scene.getObjectByName('box');
  box.material = materialList[materialValue];
  box.material.color.set(0x16050);
  const box2 = scene.getObjectByName('box2');
  box2.material = materialList[materialValue];
  box2.material.color.set(0x16023);
});

lightSelect.addEventListener('change', () => {
  lightValue = lightSelect.value;
  const light = scene.getObjectByName('light');
  const helper = scene.getObjectByName('helper');
  scene.remove(light);
  helper && scene.remove(helper);
  setLight();
});

const position = [
  -1, -1, 1, 1, -1, 1, 1, 1, 1, // front face
  1, 1, 1, -1, 1, 1, -1, -1, 1,
  1, -1, 1, 1, -1, -1, 1, 1, -1, // right face
  1, 1, -1, 1, 1, 1, 1, -1, 1,
  1, -1, -1, -1, -1, -1, -1, 1, -1, // backface
  -1, 1, -1, 1, 1, -1, 1, -1, -1,
  -1, -1, -1, -1, -1, 1, -1, 1, 1, // left face
  -1, 1, 1, -1, 1, -1, -1, -1, -1,
  -1, 1, 1, 1, 1, 1, 1, 1, -1, // top face
  1, 1, -1, -1, 1, -1, -1, 1, 1,
  1, -1, 1, -1, -1, 1, -1, -1, -1, // bottom face
  -1, -1, -1, 1, -1, -1, 1, -1, 1,
];

function draw(scene) {
  const box = new BoxBufferGeometry(5, 5, 5);
  const mesh = new Mesh(box, materialList[materialValue]);
  mesh.position.set(0, 5, 3);
  mesh.name = 'box';
  mesh.material.color.set(0x16050);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.renderOrder = 2;
  scene.add(mesh);

  const box2 = new BufferGeometry();
  box2.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
  box2.computeVertexNormals();
  // const normal = computeNormal(position);
  // box2.setAttribute('normal', new BufferAttribute(new Float32Array(normal), 3));
  const mesh2 = new Mesh(box2, materialList[materialValue]);
  mesh2.position.set(5, 5, 3);
  mesh2.name = 'box2';
  mesh2.material.color.set(0x16050);
  mesh2.receiveShadow = true;
  mesh2.castShadow = true;
  mesh2.renderOrder = 2;
  scene.add(mesh2);

  const { light } = lightList.directional;
  light.target = mesh;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.intensity = 1.5;
  light.position.set(50, 50, 50);
  light.name = 'light';
  scene.add(light);
  scene.add(new DirectionalLightHelper(light, 5));

  // const light = lightList['spot'].light;
  // light.target = mesh;
  // light.shadow.mapSize.width = 1024;
  // light.shadow.mapSize.height = 1024;
  // light.intensity = 1;
  // light.position.set(camera.position);
  // scene.add(light);
  // light.name = 'light';
  // scene.add(new SpotLightHelper(light));

  // const light = lightList['point'].light;
  // light.position.set(50, 50, 50);
  // scene.add(light);
  // light.name = 'light';
  // scene.add(new PointLightHelper(light));

  // const light = lightList['rectArea'].light;
  // light.position.set(50, 50, 50);
  // light.lookAt(0, 0, 0);
  // scene.add(light);
}

init();

function initReflectOrthographicCamera(initialPosition) {
  const s = 15;
  const h = window.innerHeight;
  const w = window.innerWidth;
  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(-30, 40, 30);

  const camera = new OrthographicCamera(-s, s, -s * (h / w), +s * (h / w), 1, 100000);
  camera.position.copy(position);
  camera.lookAt(new Vector3(0, 0, 0));

  return camera;
}

function computeNormal(position) {
  const normal = [];
  if (position.length % 9 !== 0) return console.warn('position % 9 !== 0');
  const t = position.length / 9;
  for (let i = 1; i <= t; i++) {
    console.log(i);
    const p1 = [position[i * 0], position[i * 1], position[i * 2]];
    const p2 = [position[i * 3], position[i * 4], position[i * 5]];
    const p3 = [position[i * 6], position[i * 7], position[i * 8]];

    console.log('p1', p1);
    console.log('p2', p2);
    console.log('p3', p3);

    const v12 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v23 = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]];

    const cross = crossVec3(v12, v23);
    const faceNormal = normalizeVec3(cross);

    normal.push(...faceNormal);
  }

  return normal;
}
// axb=(aybz−azby,azbx−axbz,axby−aybx)
function crossVec3(v1, v2) {
  return [v1[1] * v2[2] - v1[2] - v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]];
}

function normalizeVec3(v) {
  const r = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  return [v[0] / r, v[1] / r, v[2] / r];
}
