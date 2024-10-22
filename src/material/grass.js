/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-22 10:54:08
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-22 16:37:57
 * @FilePath: \threejs-demo\src\material\grass.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  TextureLoader,
  ShaderMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initGUI,
  initScene,
  imagePath,
  initStats,
  resize,
  initPerspectiveCamera,
  initOrbitControls,
  initSky,
} from "../lib/tools/index.js";

window.onload = () => {
  init();
};

// 顶点着色器
const vertexShader = /*GLSL*/ `
  attribute vec3 color;
  varying vec2 vUv;
  varying vec2 vCloudUV;
  varying vec3 vColor;
  uniform float uTime;

  void main() {
      vec3 newPosition = position;

      float waveSize = 12.0;
      float tipDistance = 0.3;
      float centerDistance = 0.1;

      // 根据顶点颜色进行偏移处理
      if(color.x > 0.5) {
          newPosition.x += sin(uTime + uv.x * waveSize) * tipDistance;
      } else if(color.x > 0.0) {
          newPosition.x += sin(uTime + uv.x * waveSize) * centerDistance;
      }

      // 云纹理UV坐标计算
      vec2 cloudUv = uv;
    cloudUv.x = mod(cloudUv.x + uTime * 0.05, 1.0); // 循环飘动效果
    cloudUv.y = mod(cloudUv.y + uTime * 0.01, 1.0); // 循环飘动效果

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      vUv = uv;
      vCloudUV = cloudUv;
      vColor = color;
  }
`;

// 片元着色器
const fragmentShader = /*GLSL*/ `
  uniform sampler2D uGrassTexture;
  uniform sampler2D uCloudTexture;
  varying vec2 vUv;
  varying vec2 vCloudUV;
  varying vec3 vColor;

  void main() {
      float contrast = 1.5;
      float brightness = 0.1;
      vec3 color = vec3(0.0);

      // 获取草地和云纹理的颜色
      vec3 grassColor = texture2D(uGrassTexture, vUv).rgb;
      vec3 cloudColor = texture2D(uCloudTexture, vCloudUV).rgb;

      // 调整对比度和亮度
      color = grassColor * contrast;
      color += brightness;

      // 混合云和草的效果
      float mixStrength = 1.0 - cloudColor.r;
      mixStrength *= cloudColor.g;
      if(cloudColor.x == 0.0 && cloudColor.y == 0.0 && cloudColor.z == 0.0) {
          mixStrength = 0.0;
      }

      color = mix(color, vec3(0.0), mixStrength);
      gl_FragColor = vec4(color, 1.0);
  }
`;

async function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(0, 20, 50));
  camera.zoom = 2;
  camera.updateProjectionMatrix();

  const controls = initOrbitControls(camera, renderer.domElement);

  const status = initStats();
  const scene = initScene();

  initSky(scene);

  const loader = new TextureLoader();

  const grassTexture = loader.load(`../../${imagePath}/others/grass.jpg`);
  const cloudTexture = loader.load(`../../${imagePath}/others/cloud.jpg`);

  const geometry = generateGrassGeometry(400000);
  const shaderMaterial = new ShaderMaterial({
    uniforms: {
      uGrassTexture: { value: grassTexture },
      uCloudTexture: { value: cloudTexture },
      uTime: { value: 0.0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const materialMap = {
    shaderMaterial,
    basicMaterial: new MeshBasicMaterial({ side: 2, vertexColors: true }),
    normalMaterial: new MeshNormalMaterial({ side: 2 }),
  };

  const params = {
    material: "shaderMaterial",
  };

  const mesh = new Mesh(geometry, materialMap[params.material]);
  scene.add(mesh);

  function render() {
    renderer.render(scene, camera);
    controls.update();
    status.update();
    shaderMaterial.uniforms.uTime.value += 0.01;
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, [camera]);

  const gui = initGUI();
  gui.add(params, "material", Object.keys(materialMap)).onChange(() => {
    mesh.material = materialMap[params.material];
  });
}

function generateGrassGeometry(grassCount) {
  const geometry = new BufferGeometry();
  const positions = [];
  const uvs = [];
  const colors = [];
  const indices = [];

  for (let i = 0; i < grassCount; i++) {
    const radius = 15 * Math.sqrt(Math.random());
    const angle = Math.random() * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = 0;

    const vertexData = createSingleBlade(
      new Vector3(x, y, z),
      i * 5,
      [x / 30 + 0.5, z / 30 + 0.5],
      0.8
    );

    vertexData.vertices.forEach((vert) => {
      positions.push(...vert.pos);
      uvs.push(...vert.uv);
      colors.push(...vert.color);
    });

    vertexData.indices.forEach((index) => indices.push(index));
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// 创建单片草叶的几何体数据
function createSingleBlade(basePosition, indexOffset, uv, height) {
  const baseWidth = 0.1;
  const heightVariation = 0.6;
  const adjustedHeight = height + Math.random() * heightVariation;
  const angle1 = Math.random() * Math.PI * 2;
  const angle2 = Math.random() * Math.PI * 2;

  const direction1 = new Vector3(Math.sin(angle1), 0, -Math.cos(angle1));
  const direction2 = new Vector3(Math.sin(angle2), 0, -Math.cos(angle2));

  const v1 = new Vector3().addVectors(
    basePosition,
    direction1.clone().multiplyScalar(baseWidth / 2)
  );
  const v2 = new Vector3().addVectors(
    basePosition,
    direction1.clone().multiplyScalar(-baseWidth / 2)
  );
  const v3 = new Vector3()
    .addVectors(basePosition, direction1.clone().multiplyScalar(baseWidth / 4))
    .setY(adjustedHeight / 2);
  const v4 = new Vector3()
    .addVectors(basePosition, direction1.clone().multiplyScalar(-baseWidth / 4))
    .setY(adjustedHeight / 2);
  const v5 = new Vector3()
    .addVectors(basePosition, direction2.clone().multiplyScalar(baseWidth))
    .setY(adjustedHeight);

  return {
    vertices: [
      { pos: v1.toArray(), uv: uv, color: [0, 0, 0] },
      { pos: v2.toArray(), uv: uv, color: [0, 0, 0] },
      { pos: v3.toArray(), uv: uv, color: [0.5, 0.5, 0.5] },
      { pos: v4.toArray(), uv: uv, color: [0.5, 0.5, 0.5] },
      { pos: v5.toArray(), uv: uv, color: [1, 1, 1] },
    ],
    indices: [
      indexOffset,
      indexOffset + 1,
      indexOffset + 2,
      indexOffset + 1,
      indexOffset + 3,
      indexOffset + 2,
      indexOffset + 2,
      indexOffset + 3,
      indexOffset + 4,
    ],
  };
}
