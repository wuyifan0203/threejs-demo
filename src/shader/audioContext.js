/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-16 13:35:42
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-16 16:48:38
 * @FilePath: \threejs-demo\src\material\audioContext.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  Vector3,
  Mesh,
  BoxGeometry,
  Color,
  ShaderMaterial,
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initCustomGrid,
  initOrbitControls,
  initGUI,
  initScene,
} from "../lib/tools/index.js";

window.onload = () => {
  init();
};

const colors = [
  new Color(0.5, 0.0, 1.0), // 紫色
  new Color(0.0, 0.0, 1.0), // 蓝色
  new Color(0.0, 1.0, 1.0), // 青色
  new Color(0.0, 1.0, 0.0), // 绿色
  new Color(1.0, 1.0, 0.0), // 黄色
  new Color(1.0, 0.0, 0.0), // 红色
];

const vertexShader = /*glsl*/ `
  varying vec4 vPosition;
  void main() {
    vPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /*glsl*/ `
  varying vec4 vPosition;
  uniform float uScale;
  uniform vec3 colors[6];
  void main() {
    float intensity = clamp((vPosition.y + 13.0) * uScale / 255.0, 0.0, 1.0);

    float segment = intensity * 5.0;
    int index = int(segment);
    float t = fract(segment);

    vec3 outputColor  = mix(colors[index], colors[index + 1], t);
    gl_FragColor = vec4(outputColor , 1.0);
  }
`;

function init() {
  const renderer = initRenderer();
  renderer.setClearColor(0xefefef);

  const camera = initOrthographicCamera(new Vector3(0, 0, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.4;
  camera.updateProjectionMatrix();

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const scene = initScene();
  const grid = initCustomGrid(scene, 64, 26, 0.5, 1);
  grid.position.x = 0.25;

  const bars = [];
  const barCount = 64;
  const geometry = new BoxGeometry(0.5, 1, 0.5);
  const material = new ShaderMaterial({
    uniforms: {
      colors: { value: colors },
      uScale: { value: 1.0 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  for (let i = 0, offset = 0; i < barCount; i++, offset = i - barCount / 2) {
    const bar = new Mesh(geometry, material.clone());
    bar.position.x = offset;
    scene.add(bar);
    bars.push(bar);

    const mirrorBar = new Mesh(geometry, material.clone());
    mirrorBar.position.x = -offset;
    scene.add(mirrorBar);
    bars.push(mirrorBar);

    bar.position.y = mirrorBar.position.y = -12.5;
  }

  const audio = new Audio(`../../public/audio/Shooting Star.mp3`);
  audio.crossOrigin = "anonymous";

  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();

  const source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  source.connect(audioContext.destination);

  analyser.fftSize = barCount * 2;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const length = bars.length - 1;
  function update() {
    analyser.getByteFrequencyData(dataArray);
    for (let i = 0, j = length; i < barCount; i++, j = length - i) {
      const scale = dataArray[barCount - i] / 10;
      const height = scale < 1 ? 1 : scale;
      const y = -13 + height / 2;
      bars[i].scale.y = height;
      bars[j].scale.y = height; // 更新对称条形的缩放
      bars[i].position.y = bars[j].position.y = y;
      bars[i].material.uniforms.uScale.value = scale;
      bars[j].material.uniforms.uScale.value = scale;
    }
  }

  function render() {
    renderer.clear();
    renderer.render(scene, camera);
    orbitControls.update();
    update();
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);

  const controls = {
    play() {
      audioContext.resume().then(() => {
        audio.play();
      });
    },
    pause() {
      audioContext.resume().then(() => {
        audio.pause();
      });
    },
  };

  const gui = initGUI();

  gui.add(controls, "play");
  gui.add(controls, "pause");


  document.querySelector("#webgl-play").addEventListener("click", () => {
    audioContext.resume().then(() => {
      audio.play();
    });
  });
}
