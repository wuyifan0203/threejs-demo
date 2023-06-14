/*
 * @Date: 2023-06-14 11:09:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 13:45:54
 * @FilePath: /threejs-demo/packages/app/CAD/src/lib/initialization.js
 */

import { PerspectiveCamera, Vector3,OrthographicCamera ,PCFSoftShadowMap,WebGLRenderer, Scene} from "three";

function initPerspectiveCamera(initialPosition) {
  const camera = new PerspectiveCamera(50, 1, 0.01, 1000);

  const position = (initialPosition !== undefined) ? initialPosition : new Vector3(0,5,10);
  camera.position.copy(position);

  camera.name = 'default_perspective_camera'
  camera.lookAt(new Vector3());
  return camera
}

function initOrthographicCamera(initialPosition) {
    const s = 15;
    const h = window.innerHeight;
    const w = window.innerWidth;
    const position = (initialPosition !== undefined) ? initialPosition : new Vector3(-30, 40, 30);
  
    const camera = new OrthographicCamera(-s, s, s * (h / w), -s * (h / w), 1, 10000000);
    camera.position.copy(position);
    camera.lookAt(new Vector3(0, 0, 0));
  
    return camera;
}

function initRenderer(options = {}) {
    const renderer = new WebGLRenderer(Object.assign({antialias: true},options));
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.setClearColor(0xaaaaaa)

    return renderer
}


function initScene() {
    return new Scene()
}


export {
    initPerspectiveCamera,
    initOrthographicCamera,
    initRenderer,
    initScene
}