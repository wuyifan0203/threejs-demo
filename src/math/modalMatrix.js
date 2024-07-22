/* eslint-disable no-unused-vars */

import {
  Mesh,
  Vector3,
  SphereGeometry,
  Clock,
  MeshBasicMaterial,
  TextureLoader,
  Matrix4,
  Quaternion,
  BufferGeometry,
  BufferAttribute,
  LineBasicMaterial,
  LineLoop,
  RingGeometry,
} from '../lib/three/three.module.js';

import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initScene,
  initOrbitControls
} from '../lib/tools/index.js';

Mesh.prototype.setMultiplyScale = function (unit) {
  this.scale.set(unit, unit, unit);
};

window.onload = function () {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  const camera = initOrthographicCamera(new Vector3(1000, 1000, 300));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.2;
  const scene = initScene();

  renderer.setClearColor(0xffffff);

  const orbitControl = initOrbitControls(camera, renderer.domElement);

  const sphere = new SphereGeometry(1, 32, 32);

  const createMaterial = (params = { color: '#fff' }) => new MeshBasicMaterial(params);

  resize(renderer, camera);

  //                          Sun : Mercury : Venus : Earth : Mars : Jupiter : Saturn : Uranus : Neptune   Unit
  // Radius                   109 :   0.38  : 0.94  :   1   : 0.53 : 10.97   :  9.14  :  3.98  :  3.86   (6,371 km)
  // Distance                  0  :   0.39  : 0.72  :   1   : 1.52 :  5.20   :  9.58  :  19.18 :  30.07  (1 AU)
  // period of revolution         :   0.24  : 0.62  :   1   : 1.88 :  11.86  :  29.46 :  84.01 :  164.8  (1 Earth Year)
  // Direction of revolution      :    C    :  AC   :   C   :   C  :    C    :    C   :    AC  :    C
  // period of rotation           :   58.6  :  243  :   1   : 1.03 :  0.41   :  0.44  :   0.72 :  0.67   (1 Earth Day)
  // Direction of rotation        :    C    :  AC   :   C   :   C  :    C    :    C   :    AC  :    AC

  // set background
  const basePath = '../../public/images/plants/2k_';
  const loader = new TextureLoader();
  const getTexture = (path) => loader.load(basePath + path);
  scene.background = getTexture('stars_milky_way.jpg');

  const plantsScale = [10, 0.4, 0.94, 1, 0.65, 2.5, 3.5, 2.98, 2.86];
  const plantsPosition = [0, 16, 20, 25, 29, 35, 44, 54, 64];
  const plantsRevolutionAngularSpeed = [0, 4.147, -1.625, 1, 0.531, 0.0843, 0.0336, -0.0117, 0.0059];
  const plantsRotationAngularSpeed = [0, 6.138, -1.481, 1, 0.971, 0.096, 0.106, -0.718, -0.671];

  const orbits = {};
  const plants = {};
  const orbitMaterial = new LineBasicMaterial({ color: '#ffffff' });

  const texture = {
    Sun: getTexture('sun.jpg'),
    Mercury: getTexture('mercury.jpg'),
    Venus: getTexture('venus_surface.jpg'),
    Earth: getTexture('earth_daymap.jpg'),
    Mars: getTexture('mars.jpg'),
    Jupiter: getTexture('jupiter.jpg'),
    Saturn: getTexture('saturn.jpg'),
    Uranus: getTexture('uranus.jpg'),
    Neptune: getTexture('neptune.jpg'),
  };

  Object.keys(texture).forEach((key, i) => {
    // create plant Mesh
    const plantMesh = new Mesh(sphere, createMaterial());
    // set texture for plant
    plantMesh.material.map = texture[key];
    plantMesh.name = key;
    // add plant Mesh
    scene.add(plantMesh);
    plants[key] = plantMesh;

    // create orbit geometry and LineLoop
    const orbitGeometry = new BufferGeometry();
    orbitGeometry.setAttribute('position', new BufferAttribute(getPlantOrbitPosition(plantsPosition[i]), 3));
    const orbitMesh = new LineLoop(orbitGeometry, orbitMaterial);
    // add orbit LineLoop
    scene.add(orbitMesh);
    orbits[key] = orbitMesh;
  });

  // 添加土星环
  const ringGeometry = new RingGeometry(1.1, 1.8, 30, 1, 0, Math.PI * 2);
  const saturnRingMesh = new Mesh(ringGeometry, createMaterial({ color: '#837c71', side: 2 }));
  plants.Saturn.add(saturnRingMesh);

  // 常量
  const axisX = new Vector3(1, 0, 0);
  const axisZ = new Vector3(0, 0, 1);
  const { PI } = Math;
  const HalfPI = PI / 2;
  const PI2 = 2 * Math.PI;

  let t; let
    pos;
  const clock = new Clock();
  const tarnslateMat4 = new Matrix4();
  const rotateMat4 = new Matrix4();
  const rotateZMat4 = new Matrix4();
  const rotateXMat4 = new Matrix4().makeRotationAxis(axisX, HalfPI);
  const scaleMat4 = new Matrix4();
  const modalMatrix = new Matrix4();

  const position = new Vector3();
  const rotate = new Quaternion();
  const scale = new Vector3();

  function animatePosition() {
    t = clock.getElapsedTime();
    Object.keys(texture).forEach((key, i) => {
      // 初始化
      modalMatrix.identity();
      rotateMat4.identity();
      scaleMat4.identity();
      tarnslateMat4.identity();
      rotateZMat4.identity();

      const mesh = plants[key];
      // 计算公转
      pos = circlingMotion(plantsPosition[i], plantsRevolutionAngularSpeed[i], t, 0, 0);
      tarnslateMat4.makeTranslation(pos.x, pos.y, 0);
      // 计算自转
      rotateMat4.premultiply(rotateXMat4).premultiply(rotateZMat4.makeRotationZ(t * plantsRotationAngularSpeed[i]));
      // 对应缩放比例
      scaleMat4.makeScale(plantsScale[i], plantsScale[i], plantsScale[i]);
      // 计算模型矩阵
      modalMatrix.multiply(tarnslateMat4.multiply(rotateMat4.multiply(scaleMat4)));
      // 分解模型矩阵
      modalMatrix.decompose(position, rotate, scale);
      // 分别赋值
      mesh.position.copy(position);
      mesh.quaternion.copy(rotate);
      mesh.scale.copy(scale);
    });
  }

  render();
  function render() {
    orbitControl.update();
    renderer.render(scene, camera);
    // 计算位置
    animatePosition();
    requestAnimationFrame(render);
  }

  function circlingMotion(r, w, t, x, y) {
    return { x: x + r * Math.cos(w * t), y: y + r * Math.sin(w * t) };
  }

  function getPlantOrbitPosition(radius) {
    return drawCirCling(0, 0, radius, 64);
  }

  function drawCirCling(x, y, radius, segment = 32) {
    const { PI, sin, cos } = Math;
    const position = new Float32Array(segment * 3);
    let theta = 0;
    for (let index = 0; index < segment; index++) {
      theta = (index / segment) * PI * 2;
      position[index * 3] = x + radius * cos(theta);
      position[index * 3 + 1] = y + radius * sin(theta);
      position[index * 3 + 2] = 0;
    }
    return position;
  }
}
