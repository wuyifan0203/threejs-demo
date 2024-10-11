/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-09 17:45:30
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-11 18:32:56
 * @FilePath: \threejs-demo\src\material\cloud.JS
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  Vector3,
  Mesh,
  AmbientLight,
  BoxGeometry,
  PointLight,
  MeshStandardMaterial,
  NoBlending,
  NormalBlending,
  AdditiveBlending,
  SubtractiveBlending,
  MultiplyBlending,
  FrontSide,
  BackSide,
  DoubleSide,
  CanvasTexture,
  ClampToEdgeWrapping,
  RepeatWrapping,
  TextureLoader,
  PlaneGeometry,
  ShaderMaterial,
  InstancedMesh,
  Object3D,
  InstancedBufferAttribute,
  MeshBasicMaterial,
} from "../lib/three/three.module.js";
import { mergeBufferGeometries } from "../lib/three/BufferGeometryUtils.js";
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initCustomGrid,
  initOrbitControls,
  initGUI,
  initScene,
  imagePath,
  initStats,
} from "../lib/tools/index.js";
import { createRandom } from "../lib/tools/math.js";

window.onload = () => {
  init();
};

const vs = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;

const fs = /* glsl */ `
varying vec2 vUv;
uniform sampler2D map;

void main(){
  gl_FragColor = texture2D(map, vUv);
}
`;

async function init() {
  const renderer = initRenderer();

  const camera = initOrthographicCamera(new Vector3(100, 100, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const status = initStats();

  const scene = initScene();
  // initCustomGrid(scene);

  scene.add(new AmbientLight());

  const params = {
    count: 800,
  };

  // dummy
  const dummy = new Object3D();

  // background
  const backgroundCanvas = document.createElement("canvas");
  const ctx = backgroundCanvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, backgroundCanvas.height);
  gradient.addColorStop(0, "#1e4877");
  gradient.addColorStop(0.5, "#4584b4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

  const bgTexture = new CanvasTexture(backgroundCanvas);
  scene.background = bgTexture;

  // cloud
  const loader = new TextureLoader();
  const cloudTexture = await loader.loadAsync(
    `../../${imagePath}/others/cloud.png`
  );

  const geometry = new PlaneGeometry(10, 10);
  const material = new ShaderMaterial({
    uniforms: {
      map: {
        value: cloudTexture,
      },
    },
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true,
  });

  const mesh = new InstancedMesh(geometry, material, params.count);
  console.log("mesh: ", mesh);

  // for (let j = 0, k = params.count; j < k; j++) {
  //   dummy.position.x = createRandom(-500, 500);
  //   dummy.position.y = -Math.random() * Math.random() * 200 - 15;
  //   dummy.position.z = j;
  //   dummy.rotation.z = Math.random() * Math.PI;
  //   dummy.scale.x = dummy.scale.y = Math.random() * Math.random() * 1.5 + 0.5;
  //   dummy.updateMatrix();

  //   mesh.setMatrixAt(j, dummy.matrix);
  // }

  // mesh.instanceMatrix.needsUpdate = true;

  scene.add(mesh);
  function updateMeshCount() {
    mesh.count = params.count;
    mesh.dispose();
    mesh.instanceMatrix = new InstancedBufferAttribute(
      new Float32Array(params.count * 16),
      16
    );

    for (let j = 0, k = params.count; j < k; j++) {
      dummy.position.x = createRandom(-500, 500);
      dummy.position.y = -Math.random() * Math.random() * 200 - 15;
      dummy.position.z = j;
      dummy.rotation.z = Math.random() * Math.PI;
      dummy.scale.x = dummy.scale.y = Math.random() * Math.random() * 1.5 + 0.5;
      dummy.updateMatrix();
      mesh.setMatrixAt(j, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  updateMeshCount();
  function render() {
    renderer.render(scene, camera);
    orbitControls.update();
    status.update();
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);

  const gui = initGUI();

  gui.add(params, "count", 0, 10000).onChange(updateMeshCount);
}
