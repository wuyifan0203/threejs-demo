/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date:  2023-05-10 18:26:20
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-12 18:24:27
 * @FilePath: \threejs-demo\src\shader\materialTest.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Vector3, Mesh, BoxGeometry } from "../lib/three/three.module.js";
import {
  initRenderer,
  initPerspectiveCamera,
  initOrbitControls,
  initGUI,
  resize,
  initScene,
} from "../lib/tools/index.js";

import { BasicMaterial } from "./material/basic.js";
import { NormalMaterial } from "./material/normal.js";

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  const camera = initPerspectiveCamera(new Vector3(0, 0, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  const orbitControls = initOrbitControls(camera, renderer.domElement);
  const params = {
    materialType: "basic",
    color: "#ff0000",
  };

  const materials = {
    basic: new BasicMaterial(),
    normal: new NormalMaterial(),
  };

  const material = new BasicMaterial();
  material.uniforms.color.value.set(1.0, 0.0, 0.0);

  const geometry = new BoxGeometry(10, 10, 10);

  const mesh = new Mesh(geometry, material);

  scene.add(mesh);

  resize(renderer, camera);

  function render() {
    orbitControls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);

  const gui = initGUI();
  gui.add(params, "materialType", Object.keys(materials)).onChange(() => {
    mesh.material = materials[params.materialType];
    mesh.material.uniforms.color.value.set(params.color);
    mesh.material.needsUpdate = true;
    console.log('params.materialType: ', params.materialType);
  });
  gui.addColor(params, "color").onChange(() => {
    mesh.material.uniforms.color.value.set(params.color);
    mesh.material.needsUpdate = true;
  });
}
