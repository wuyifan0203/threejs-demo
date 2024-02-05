/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-21 09:25:33
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-05 16:02:30
 * @FilePath: /threejs-demo/src/texture/commonTexture.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  TextureLoader,
  PerspectiveCamera,
  AmbientLight,
  SpotLight,
  WebGLRenderer,
  Color,
} from '../lib/three/three.module.js';
import {
  initGUI,
  initScene,
  initOrbitControls,
  initDirectionLight
} from '../lib/tools/index.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { FBXLoader } from '../lib/three/FBXLoader.js';

window.onload = function () {
  init();
};

async function init() {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = 2;
  renderer.setClearColor(0xffffff);
  renderer.setClearColor(new Color(0x000000));
  renderer.setSize(1000, window.innerHeight);
  renderer.autoClear = false;

  document.getElementById('webgl-output').appendChild(renderer.domElement);
  const camera = new PerspectiveCamera(75, 1000 / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.lookAt(0, 0, 0);

  const scene = initScene();
  scene.add(new AmbientLight());
  
  const light = initDirectionLight();
  light.position.set(0, 0, 10);
  scene.add(camera);
  camera.add(light);

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  const modelLoader = new FBXLoader();
  const textureLoader = new TextureLoader();
  const basePath = '../../public/';

  const modelGroup = await modelLoader.loadAsync(`${basePath}models/th5jddwva_LOD0.fbx`, (ProgressEvent) => {
    console.log(
      `loading model progress: ${(ProgressEvent.loaded / ProgressEvent.total) * 100} %`,
    );
  });

  light.target = modelGroup;
  // eslint-disable-next-line no-return-await
  const loadTexture = async (name) => await textureLoader.loadAsync(
    `${basePath}images/fruit/2K_${name}.jpg`,
    (ProgressEvent) => {
      console.log(
        `loading texture ${name} progress: ${(ProgressEvent.loaded / ProgressEvent.total) * 100} %`,
      );
    },
  );

  const textureList = {
    map: 'Albedo', // 反照率贴图
    // 用于模拟物体表面颜色的纹理贴图。它通常包含了物体表面的颜色信息，但不包括任何阴影或高光等材质属性。
    normalMap: 'Normal',
    aoMap: 'AO', // Ambient Occlusion 灰度图像
    // 用于控制材质表面在环境遮挡下的亮度，即在遮挡区域中更暗，在未遮挡区域中更亮。
    // 可以使材质表面更真实地反映环境遮挡，从而增强场景的真实感和深度感。
    roughnessMap: 'Roughness',
    displacementMap: 'Displacement', // 位移贴图
    // 其中白色表示物体表面最高点，黑色表示物体表面最低点，灰色则表示中间值
    // 可以使物体表面更真实地反映几何细节，从而增强场景的真实感和深度感
  };

  const textureMap = {
    map: await loadTexture(textureList.map),
    normalMap: await loadTexture(textureList.normalMap),
    aoMap: await loadTexture(textureList.aoMap),
    roughnessMap: await loadTexture(textureList.roughnessMap),
    displacementMap: await loadTexture(textureList.displacementMap),
  };

  scene.add(modelGroup);

  const modelMesh = modelGroup.children[0];
  modelMesh.material.map = textureMap.map;
  modelMesh.material.normalMap = textureMap.normalMap;
  modelMesh.material.aoMap = textureMap.aoMap;
  modelMesh.material.roughnessMap = textureMap.roughnessMap;
  modelMesh.material.displacementMap = textureMap.displacementMap;

  function render() {
    orbitControls.update();
    renderer.clear();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  renderer.setAnimationLoop(render);

  const gui = initGUI();

  const controls = {
    map: true,
    normalMap: true,
    aoMap: true,
    roughnessMap: true,
    displacementMap: true,
  };

  gui.add(controls, 'map').name('Albedo').onChange((e) => {
    modelMesh.material.map = e ? textureMap.map : null;
    modelMesh.material.needsUpdate = true;
  });
  gui.add(controls, 'normalMap').name('Normal').onChange((e) => {
    modelMesh.material.normalMap = e ? textureMap.normalMap : null;
    modelMesh.material.needsUpdate = true;
  });
  gui.add(controls, 'aoMap').name('AO').onChange((e) => {
    modelMesh.material.aoMap = e ? textureMap.aoMap : null;
    modelMesh.material.needsUpdate = true;
  });
  gui.add(controls, 'roughnessMap').name('Roughness').onChange((e) => {
    modelMesh.material.roughnessMap = e ? textureMap.roughnessMap : null;
    modelMesh.material.needsUpdate = true;
  });
  gui.add(controls, 'displacementMap').name('Displacement').onChange((e) => {
    modelMesh.material.displacementMap = e ? textureMap.displacementMap : null;
    modelMesh.material.needsUpdate = true;
  });
}
