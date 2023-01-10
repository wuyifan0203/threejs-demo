/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-10 16:59:25
 * @FilePath: /threejs-demo/src/examples/booleanOperation/index.js
 */
import {
    Vector3,
    Scene,
    Mesh,
    MeshNormalMaterial,
  } from "../../lib/three/three.module.js";
  import {
    initRenderer,
    initPerspectiveCamera,
    createAxesHelper,
    initCustomGrid,
    resize
  } from "../../lib/tools/index.js";
  import { OrbitControls } from "../../lib/three/OrbitControls.js";
  import { ViewHelper } from "../../lib/three/viewHelper.js";
  import dat from '../../lib/util/dat.gui.js' 
  
  window.onload = function () {
    init();
  };
  
  function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
    const scene = new Scene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer,camera)
    initCustomGrid(scene,100,100);
    createAxesHelper(scene);
  
    const controls = new OrbitControls(camera, renderer.domElement);
    const viewHelper = new ViewHelper(camera, renderer.domElement);
   
    draw(scene);
  
    render();
    function render() {
      renderer.clear();
      controls.update();
      renderer.render(scene, camera);
      viewHelper.render(renderer);
      requestAnimationFrame(render);
    }
   
  }
  
  function draw(scene) {

    const gui = new dat.GUI();
    console.log(gui);

    const controls = new function () {
        this.test = true
        
    }

    gui.add(controls,'test').onChange(e=>{
        console.log(e);
    })

  }
  
  
  