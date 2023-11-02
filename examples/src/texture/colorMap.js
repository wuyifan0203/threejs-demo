/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-21 17:28:48
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-25 01:28:30
 * @FilePath: /threejs-demo/examples/src/viewHouse3D/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Scene,
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
  TextureLoader,
  BackSide,
  PerspectiveCamera,
  Sprite,
  SpriteMaterial,
  Raycaster,
  Vector2,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { initRenderer, } from '../lib/tools/index.js';

const basePath = '../../public/images/house/';
const url = {
  livingRoom: `${basePath}livingRoom.jpg`,
  livingRoom2: `${basePath}livingRoom2.jpg`,
  masterBedroom: `${basePath}masterBedroom.jpg`,
  guestBedroom: `${basePath}guestRoom.jpg`,
  toilet: `${basePath}toilet.jpg`,
  arrow: '../../public/images/others/arrow.jpg',
};

const loader = new TextureLoader();

const texture = {
  livingRoom: loader.load(url.livingRoom),
  livingRoom2: loader.load(url.livingRoom2),
  masterBedroom: loader.load(url.masterBedroom),
  guestBedroom: loader.load(url.guestBedroom),
  toilet: loader.load(url.toilet),
  arrow: loader.load(url.arrow),
};

let location = 'livingRoom';

const material = new MeshBasicMaterial({
  map: texture[location],
  side: BackSide,
});

const spriteMaterial = new SpriteMaterial({ map: texture.arrow });

const spriteList = {
  livingRoom: createSprite(),
  livingRoom2: createSprite(),
  masterBedroom: createSprite(),
  guestBedroom: createSprite(),
  toilet: createSprite(),
};

const raycaster = new Raycaster();
const pointer = new Vector2();

const positionMap = {
  livingRoom: {
    toilet: [2.54, 0, -9],
    livingRoom2: [6.6, -3.5, -6],
  },
  toilet: { livingRoom: [4, 0, 8], },
  livingRoom2: {
    livingRoom: [8, -3.5, -4],
    masterBedroom: [-6, 0, 7],
    guestBedroom: [-9, 0, 0],
  },
  masterBedroom: { livingRoom2: [-6.5, 0, 6], },
  guestBedroom: { livingRoom2: [-7, 0, -5.5], },
};

(function () {
  init();
}());

function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0.5;
  camera.lookAt(10, 0, 0);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxDistance = 50;
  draw(scene);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.clear();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }
  // document.addEventListener('dblclick')

  renderer.domElement.addEventListener('dblclick', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(Object.values(spriteList));
    if (intersects.length) {
      updateTexture(intersects);
      updateSpritePosition();
    }
  });
}

function draw(scene) {
  const sphere = new SphereBufferGeometry(10, 64, 32);
  initSprite(scene);

  const mesh = new Mesh(sphere, material);
  scene.add(mesh);
}

function initSprite(scene) {
  updateSpritePosition();

  Object.keys(spriteList).forEach((key) => {
    const sprite = spriteList[key];
    sprite.name = key;
    scene.add(sprite);
  });
}

function createSprite() {
  return new Sprite(spriteMaterial);
}

function updateTexture(intersects) {
  const { object: target } = intersects.find((intersect) => intersect.object.visible === true);
  material.map = texture[target.name];
  location = target.name;
}

function updateSpritePosition() {
  Object.values(spriteList).forEach((sprite) => {
    sprite.visible = false;
  });

  const position = positionMap[location];
  Object.keys(position).forEach((key) => {
    const sprite = spriteList[key];
    sprite.visible = true;
    sprite.position.set(...position[key]);
  });
}
