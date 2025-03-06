/*
 * @Date: 2023-01-30 14:03:05
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 15:27:09
 * @FilePath: /threejs-demo/src/loader/OBJLoader.js
 */
/* eslint-disable no-unused-vars */
import {
  initRenderer,
  initPerspectiveCamera,
  resize,
  initGUI,
  initScene,
  initOrbitControls,
  initAmbientLight,
  initLoader,
  Model_Path
} from '../lib/tools/index.js';
import {
  Vector3,
  Mesh,
  Shape,
  SpotLight,
  SpotLightHelper,
  ShapeGeometry,
  MeshPhongMaterial,
  Color,
  Box3,
} from 'three';

window.onload = () => {
  init();
};

const init = () => {
  const renderer = initRenderer();
  renderer.setClearColor('#000000')
  // 1
  renderer.shadowMap.enabled = true;
  const camera = initPerspectiveCamera(new Vector3(100, 1, 60));
  camera.up.set(0, 0, 1);

  const scene = initScene();

  initAmbientLight(scene);

  const light = new SpotLight(0xffffff, 3 * Math.PI, 180, 0.58, 1, 0.1);
  light.shadow.mapSize.height = 2048;
  light.shadow.mapSize.width = 2048;
  light.position.set(3.3, 10, 100);
  light.castShadow = true;
  scene.add(light);
  const spotLightHelper = new SpotLightHelper(light);
  spotLightHelper.visible = false;
  scene.add(spotLightHelper);

  const circleRadius = 80;
  const circleShape = new Shape()
    .moveTo(0, circleRadius)
    .absarc(0, 0, circleRadius, 0, Math.PI * 2, false);
  const groundPlane = new Mesh(
    new ShapeGeometry(circleShape),
    new MeshPhongMaterial(),
  );

  scene.add(groundPlane);

  groundPlane.rotation.z = -0.5 * Math.PI;
  // 2
  groundPlane.receiveShadow = true;

  const controls = initOrbitControls(camera, renderer.domElement);
  resize(renderer, camera);

  const loader = initLoader();
  new Promise((resolve, reject) => {
    loader.load(
      `../../${Model_Path}/mountain_lions.obj`,
      (obj) => {
        /// 模型太大了，缩放一下
        obj.rotateX(Math.PI / 2);
        scene.add(obj);
        //   obj.children[0].material.color.set(new Color("gray"));
        // 重新计算模型最新位置，并放在中心点
        resolve(obj);
      },
      (ProgressEvent) => {
        // console.log(
        //   `progress: ${(ProgressEvent.loaded / ProgressEvent.total) * 100} %`,
        // );
      },
      (error) => {
        console.log(`Opp ! have an Error in ${error}`);
        reject(error);
      },
    );
  }).then((obj) => {
    console.log(obj);
    obj.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    obj.scale.set(0.3, 0.3, 0.3)
    const box = new Box3().expandByObject(obj);
    const center = new Vector3();
    box.getCenter(center);
    obj.position.set(-center.x, -center.y, -box.min.z);
    console.log(center);
    console.log(box);
  });

  const gui = initGUI();

  const options = {
    color: light.color,
  };

  const updateHelper = (e) => spotLightHelper.update();

  gui.addColor(options, 'color').onChange((e) => {
    light.color = new Color(e.r, e.g, e.b);
  });
  gui.add(light, 'decay', 0, 15.01);
  gui.add(light, 'angle', 0, Math.PI * 2).onChange(updateHelper);
  gui.add(light, 'intensity', 0, 10).onChange(updateHelper);
  gui.add(light, 'penumbra', 0, 1).onChange(updateHelper);
  gui.add(light, 'distance', 0, 200).onChange(updateHelper);
  gui.add(light, 'castShadow');

  gui.add(spotLightHelper, 'visible').name('show helper');

  gui.add(light.position, 'x', -200, 200, 0.1).onChange(updateHelper);
  gui.add(light.position, 'y', -200, 200, 0.1).onChange(updateHelper);
  gui.add(light.position, 'z', -200, 200, 0.1).onChange(updateHelper);


  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();


};


