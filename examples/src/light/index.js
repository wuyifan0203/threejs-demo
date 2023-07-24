import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer,
  initOrthographicCamera,
  initAxesHelper,
  initGroundPlane,
  resize,
} from '../lib/tools/index.js';
import {
  Scene,
  Vector3,
  Mesh,
  BoxGeometry,
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

} from '../lib/three/three.module.js';

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

let materialValue = 'basic';
let lightValue = 'directional';

let mesh;

const setLight = () => {
  const newLight = lightList[lightValue].light;
  newLight.name = 'light';
  const newHelper = lightList[lightValue]?.helper;
  newHelper && (newHelper.name = 'helper');
  newHelper && scene.add(newHelper);
  scene.add(newLight);
  newLight.position.set(50, 50, 50);
  newLight.castShadow = true;

  newLight.shadow.mapSize.width = 2048;
  newLight.shadow.mapSize.height = 2048;

  if (lightValue === 'spot') {
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 50;
    newLight.target = mesh;
  } else if (lightValue === 'directional') {
    newLight.target = mesh;
  }
};

const init = () => {
  const renderer = initRenderer();

  const cameraPosition = new Vector3(1000, -1000, 1000);
  const camera = initOrthographicCamera(cameraPosition);
  //   const camera = initCamera(cameraPosition);
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  scene = new Scene();
  initAxesHelper(scene);
  scene.add(new AmbientLight());

  const groundPlane = initGroundPlane(scene);
  groundPlane.position.set(0, 0, 0);
  groundPlane.rotation.z = -0.5 * Math.PI;

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  console.log(scene);
};

materialSelect.addEventListener('change', () => {
  materialValue = materialSelect.value;
  const box = scene.getObjectByName('box');
  box.material = materialList[materialValue];
  box.material.color.set(0x16050);
});

lightSelect.addEventListener('change', () => {
  lightValue = lightSelect.value;
  const light = scene.getObjectByName('light');
  const helper = scene.getObjectByName('helper');
  scene.remove(light);
  helper && scene.remove(helper);
  setLight();
  console.log(scene);
});

function draw(scene) {
  const box = new BoxGeometry(3, 5, 2);
  mesh = new Mesh(box, materialList[materialValue]);
  mesh.position.set(0, 0, 1);
  mesh.name = 'box';
  mesh.material.color.set(0x16050);
  mesh.receiveShadow = true;
  scene.add(mesh);

  setLight();
}

// (function() {
init();
// })();
