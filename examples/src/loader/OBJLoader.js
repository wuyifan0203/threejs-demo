/*
 * @Date: 2023-01-30 14:03:05
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-25 01:06:41
 * @FilePath: /threejs-demo/examples/src/loader/OBJLoader.js
 */
/* eslint-disable no-unused-vars */
import { GUI } from '../lib/util/lil-gui.module.min.js';
import { OBJLoader } from '../lib/three/OBJLoader.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer,
  initPerspectiveCamera,
  resize,
} from '../lib/tools/index.js';
import {
  Scene,
  Vector3,
  Mesh,
  Shape,
  SpotLight,
  AmbientLight,
  SpotLightHelper,
  ShapeGeometry,
  MeshPhongMaterial,
  Color,
  Matrix4,
} from '../lib/three/three.module.js';

const init = () => {
  const renderer = initRenderer();
  // 1
  renderer.shadowMap.enabled = true;
  const camera = initPerspectiveCamera(new Vector3(100, 1, 60));
  camera.up.set(0, 0, 1);

  const scene = new Scene();
  const ambientLight = new AmbientLight(0x3c3c3c);
  scene.add(ambientLight);

  const spotLight = new SpotLight(0xffffff, 1, 180, 0.68, 0, 0.2);
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.position.set(25, 10, 100);
  spotLight.castShadow = true;
  scene.add(spotLight);
  const spotLightHelper = new SpotLightHelper(spotLight);
  spotLightHelper.visible = false;
  scene.add(spotLightHelper);

  const circleRadius = 120;
  const circleShape = new Shape()
    .moveTo(0, circleRadius)
    .absarc(0, 0, circleRadius, 0, Math.PI * 2, false);
  const groundPlane = new Mesh(
    new ShapeGeometry(circleShape),
    new MeshPhongMaterial(),
  );

  scene.add(groundPlane);
  groundPlane.position.set(0, 0, -28);
  groundPlane.rotation.z = -0.5 * Math.PI;
  // 2
  groundPlane.receiveShadow = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  draw(scene, spotLight, spotLightHelper);
  resize(renderer, camera);
  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  window.camera = camera;
  window.scene = scene;
};

window.onload = () => {
  init();
};

const stop = false;

function draw(scene, light, helper) {
  const modelPath = '../../public/models/mountain_lions.obj';
  const loader = new OBJLoader();
  const newMin = new Vector3();
  const newMax = new Vector3();
  const load = new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (obj) => {
        /// 模型太大了，缩放一下
        obj.scale.set(0.1, 0.1, 0.1);
        obj.rotateX(Math.PI / 2);
        scene.add(obj);
        const modelMatrix = new Matrix4().compose(obj.position, obj.quaternion, obj.scale);

        console.log(obj);
        //   obj.children[0].material.color.set(new Color("gray"));
        // 重新计算模型最新位置，并放在中心点
        obj.children[0].geometry.computeBoundingBox();
        const { max, min } = obj.children[0].geometry.boundingBox;
        // 3
        obj.children[0].castShadow = true; // 投射阴影
        obj.children[0].receiveShadow = true;
        newMin.set(max.x, max.y, max.z).applyMatrix4(modelMatrix);
        newMin.set(min.x, min.y, min.z).applyMatrix4(modelMatrix);

        const x = (newMax.x - newMin.x) / 2 - 10;
        const y = (newMax.y - newMin.y) / 2;
        const z = (newMax.z - newMin.z) / 2;
        console.log(x, y, z);
        obj.position.set(x, y, z);
        resolve(obj);
      },
      (ProgressEvent) => {
        console.log(
          `progress: ${(ProgressEvent.loaded / ProgressEvent.total) * 100} %`,
        );
      },
      (error) => {
        console.log(`Opp ! have an Error in ${error}`);
        reject(error);
      },
    );
  });

  const gui = new GUI();

  const controls = {
    color: light.color,
    stop,
  };

  const updateHelper = (e) => helper.update();

  gui.addColor(controls, 'color').onChange((e) => {
    light.color = new Color(e.r, e.g, e.b);
  });
  gui.add(light, 'decay', 0, 15.01);
  gui.add(light, 'angle', 0, Math.PI * 2).onChange(updateHelper);
  gui.add(light, 'intensity', 0, 5).onChange(updateHelper);
  gui.add(light, 'penumbra', 0, 1).onChange(updateHelper);
  gui.add(light, 'distance', 0, 200).onChange(updateHelper);
  gui.add(light, 'castShadow');

  gui.add(helper, 'visible').name('show helper');

  gui.add(light.position, 'x', -200, 200, 0.1).onChange(updateHelper);
  gui.add(light.position, 'y', -200, 200, 0.1).onChange(updateHelper);
  gui.add(light.position, 'z', -200, 200, 0.1).onChange(updateHelper);
}
