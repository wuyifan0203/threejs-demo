/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date:  2023-05-10 18:26:20
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-04-27 13:33:57
 * @FilePath: \threejs-demo\src\shader\materialTest.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  Vector3,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  TorusKnotGeometry,
  CubeTextureLoader,
  PlaneGeometry,
} from "three";
import {
  initRenderer,
  initPerspectiveCamera,
  initOrbitControls,
  initGUI,
  resize,
  initScene,
  Image_Path,
  normalizeBufferAttribute,
  initStats,
  initAmbientLight,
  initDirectionLight
} from "../lib/tools/index.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

import { BasicMaterial } from "./material/basic.js";
import { NormalMaterial } from "./material/normal.js";
import { NormalizePositionMaterial } from "./material/normalizePosition.js";
import { CustomPhongMaterial } from "./material/phong.js"

window.onload = () => {
  init();
};

async function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(0, 30, -100));
  const scene = initScene();

  const stats = initStats();

  const ambient = initAmbientLight(scene);

  const light = initDirectionLight();
  light.position.set(100, 100, 100);
  scene.add(light);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const params = {materialType: "normalizePosition",};

  const loader = new CubeTextureLoader();
  loader.setPath(`../../${Image_Path}/snow_field/`);
  scene.background = await loader.loadAsync([
    "px.png",
    "nx.png",
    "py.png",
    "ny.png",
    "pz.png",
    "nz.png",
  ]);

  const materials = {
    basic: new BasicMaterial(),
    normal: new NormalMaterial(),
    normalizePosition: new NormalizePositionMaterial(),
    phong: new CustomPhongMaterial(),
  };

  materials[params.materialType].uniforms.color.value.set(params.color);
  materials[params.materialType].needsUpdate = true;

  const meshes = [
    new BoxGeometry(10, 10, 10),
    new SphereGeometry(5, 32, 32),
    new TorusKnotGeometry(5, 2, 100, 16),
  ].map((geometry, i, array) => {
    const mesh = new Mesh(geometry, materials[params.materialType]);
    mesh.geometry.setAttribute(
      "normalPosition",
      normalizeBufferAttribute(mesh.geometry.getAttribute("position"))
    );
    mesh.position.set(i * 20 - array.length * 5, 0, 0);

    return mesh;
  });

  scene.add(...meshes);
  const reflect = new Reflector(new PlaneGeometry(100, 100), {
    // 太他妈的卡了
    // textureWidth: window.innerWidth * 2, // 提高宽度分辨率
    // textureHeight: window.innerHeight * 2, // 提高高度分辨率
    clipBias: 0.003, // 可选，减少Z-fighting
  });
  reflect.rotateX(-Math.PI / 2);
  reflect.position.set(0, -10, 0);
  scene.add(reflect);

  resize(renderer, camera);

  (function render() {
    orbitControls.update();
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  })();

  const gui = initGUI();
  gui.add(params, "materialType", Object.keys(materials)).onChange((v) => {
    const material = materials[v];

    updateMaterial();
    Object.keys(folders).forEach((key) => {
      folders[key].hide();
    })
    folders[v].show();

    meshes.forEach((mesh) => {
      mesh.material = material;
    });

    console.log("params.materialType: ", v);
  });

  const baseMaterialParams = {color: "#ffffff",};

  const baseFolder = gui.addFolder("baseMaterial");
  baseFolder.addColor(baseMaterialParams, "color").onChange(() => {
    meshes.forEach((mesh) => {
      mesh.material.uniforms.color.value.set(baseMaterialParams.color);
      mesh.material.needsUpdate = true;
    });
  });

  const phongMaterialParams = {
    specular: "#ffffff",
    shininess: 30,
    ambientLightColor: "#ffffff",
    lightColor: "#ffffff",
    lightPosition: new Vector3().copy(light.position),
  };

  function updateMaterial() {
    const material = materials[params.materialType];
    material.uniforms.color.value.set(baseMaterialParams.color);

    if (params.materialType === 'phong') {
      material.uniforms.specular.value.set(phongMaterialParams.specular);
      material.uniforms.shininess.value = phongMaterialParams.shininess;
      material.uniforms.ambientLightColor.value.copy(ambient.color);
      material.uniforms.lightColor.value.copy(light.color);
      material.uniforms.lightPosition.value.copy(light.position)
    }
    material.needsUpdate = true;
  }

  const phongFolder = gui.addFolder("phongMaterial");
  phongFolder.addColor(baseMaterialParams,"color").onChange(updateMaterial);
  phongFolder.addColor(phongMaterialParams, "specular").onChange(updateMaterial);
  phongFolder.add(phongMaterialParams, "shininess", 0, 100).onChange(updateMaterial);
  phongFolder.addColor(phongMaterialParams, "ambientLightColor").onChange(updateMaterial);
  phongFolder.addColor(phongMaterialParams, "lightColor").onChange(updateMaterial);
  phongFolder.add(light.position, "x", -100, 100).onChange(updateMaterial).name("lightPositionX");

  var folders = {
    basic: baseFolder,
    normal: baseFolder,
    normalizePosition: baseFolder,
    phong: phongFolder,
  }
}
