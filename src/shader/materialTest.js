/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date:  2023-05-10 18:26:20
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-14 18:09:44
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
  initStats
} from "../lib/tools/index.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

import { BasicMaterial } from "./material/basic.js";
import { NormalMaterial } from "./material/normal.js";
import { NormalizePositionMaterial } from "./material/normalizePosition.js";

window.onload = () => {
  init();
};

async function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(0, 30, -100));
  const scene = initScene();

  const stats = initStats();

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  const params = {
    materialType: "normalizePosition",
    color: "#ffffff",
  };

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
  gui.add(params, "materialType", Object.keys(materials)).onChange(() => {
    meshes.forEach((mesh) => {
      mesh.material = materials[params.materialType];
      mesh.material.uniforms.color.value.set(params.color);
      mesh.material.needsUpdate = true;
    });

    console.log("params.materialType: ", params.materialType);
  });
  gui.addColor(params, "color").onChange(() => {
    meshes.forEach((mesh) => {
      mesh.material.uniforms.color.value.set(params.color);
      mesh.material.needsUpdate = true;
    });
  });
}
