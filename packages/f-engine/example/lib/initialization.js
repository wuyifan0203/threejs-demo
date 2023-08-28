/*
 * @Date         : 2023-07-14 10:24:21
 * @LastEditors  : wuyifan wuyifan@max-optics.com
 * @LastEditTime : 2023-08-03 18:02:28
 * @FilePath     : /web-gui/packages/mo-cad/examples/lib/initialization.js
 * @Copyright    : Shanghai Max-Optics information Technology Co,.Ltd.
 * @Author       : wuyifan@max-optics.com
 * @Description  :
 */

import {
  PerspectiveCamera,
  Vector3,
  OrthographicCamera,
  PCFSoftShadowMap,
  WebGLRenderer,
  Scene,
} from 'three';

/**
 * @description: 初始化一个PerspectiveCamera
 * @param {Vector3} initialPosition 初始化相机位置
 * @return {PerspectiveCamera}
 */
function initPerspectiveCamera(initialPosition) {
  const camera = new PerspectiveCamera(50, 1, 0.01, 1000);

  const position = initialPosition !== undefined ? initialPosition : new Vector3(0, 5, 10);
  camera.position.copy(position);
  camera.up.set(0, 0, 1);

  camera.lookAt(new Vector3());
  return camera;
}
/**
 * @description: 初始化一个OrthographicCamera
 * @param {Vector3} initialPosition 初始化相机位置
 * @return {OrthographicCamera}
 */
function initOrthographicCamera(initialPosition) {
  const s = 15;
  const h = window.innerHeight;
  const w = window.innerWidth;
  const position =
    initialPosition !== undefined ? initialPosition : new Vector3(5000, -5000, 10000);

  const camera = new OrthographicCamera(-s, s, s * (h / w), -s * (h / w), 1, 10000000);
  camera.position.copy(position);
  camera.zoom = 2.5;

  camera.lookAt(new Vector3(0, 0, 0));
  camera.updateProjectionMatrix();

  return camera;
}

/**
 * @description: 创建render
 * @param {Object} options  默认打开抗锯齿，详细参考https://threejs.org/docs/index.html?q=Webgl#api/zh/renderers/WebGLRenderer
 * @return {WebGLRenderer}
 */
function initRenderer(options = {}) {
  const renderer = new WebGLRenderer({ antialias: true, ...options });
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(0xaaaaaa);

  return renderer;
}

/**
 * @description: 创建场景
 * @return {Scene}
 */
function initScene() {
  return new Scene();
}

export {
 initPerspectiveCamera, initOrthographicCamera, initRenderer, initScene 
};
