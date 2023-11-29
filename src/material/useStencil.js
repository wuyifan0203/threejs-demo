/*
 * @Date: 2023-07-25 16:53:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-29 19:55:14
 * @FilePath: /threejs-demo/src/material/useStencil.js
 */
import {
    Scene,
    Vector3,

  } from '../lib/three/three.module.js';
  import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initCustomGrid,
    initOrbitControls
  } from '../lib/tools/index.js';
  
  window.onload = () => {
    init();
  };
  
  function init() {
    const renderer = initRenderer();
    renderer.setClearColor(0xefefef);
    renderer.setAnimationLoop(render);
  
    const camera = initOrthographicCamera(new Vector3(100, 100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
  
    const orbitControls = initOrbitControls(camera, renderer.domElement);
  
    const scene = new Scene();
    scene.add();

  
    function render() {
      renderer.clear();
      renderer.render(scene, camera);
      orbitControls.update();
    }
  
    resize(renderer, camera);
  }
  