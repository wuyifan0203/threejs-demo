/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-29 18:29:46
 * @FilePath: /threejs-demo/src/examples/loader/OBJLoader.js
 */
import {
    Scene,
    PointLight,
    PerspectiveCamera,
    BufferGeometry,
    PointsMaterial,
    AdditiveBlending,
    Points,
    MeshLambertMaterial,
    Float32BufferAttribute,
    AmbientLight,
    MeshBasicMaterial,
    Mesh,
    DirectionalLight,
    MeshPhongMaterial,
  } from "../../lib/three/three.module.js";
  import { OrbitControls } from "../../lib/three/OrbitControls.js";
  import { OBJLoader } from "../../lib/three/OBJLoader.js";
  import { initRenderer, resize } from "../../lib/tools/index.js";
  
  window.onload = () => {
    init();
  };
  
  function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 120);
    camera.lookAt(0, 0, 0);
    const scene = new Scene();
    renderer.setClearColor(0x000000);
    const ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
  
    const controls = new OrbitControls(camera, renderer.domElement);
    draw(scene, camera);
    resize(renderer, camera);
  
    render();
    function render() {
      controls.update();
      renderer.clear();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
  
    window.camera = camera;
    window.scene = scene;
  }
  
  function draw(scene,camera) {
  
    // model
    const modelPath = "../../resources/models/Mountain lion.OBJ";
    const loader = new OBJLoader();
    loader.load(modelPath, (obj)=>{
        scene.add(obj);
        console.log(obj);
    },
    (ProgressEvent) => {
        console.log(
            "progress: " + (ProgressEvent.loaded / ProgressEvent.total) * 100 + " %"
        );
    },
    (url) => {
        console.log("Opp ! have an Error in" + url);
    }
    );
  }
  
  