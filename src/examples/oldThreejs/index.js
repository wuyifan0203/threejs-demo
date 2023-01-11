/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-11 17:02:02
 * @FilePath: /threejs-demo/src/examples/oldThreejs/index.js
 * @Text：为了调研布尔运算，研究Geometry而建
 */
import {
    Scene,
    Mesh,
    MeshNormalMaterial,
    SphereGeometry,
    BoxGeometry,
    WebGLRenderer,
    PerspectiveCamera
  } from "./three.module.js";
  import dat from "../../lib/util/dat.gui.js";
  import { OrbitControls } from "../../lib/three/OrbitControls.js";
  import { ViewHelper } from "../../lib/three/viewHelper.js";
  import {
    resize
  } from "../../lib/tools/index.js";
  
  window.onload = function () {
    init();
  };
  
  function init() {
    const renderer = new WebGLRenderer()
    const camera = new PerspectiveCamera(75,window.innerHeight/window.innerWidth,0.1,10000)
    const scene = new Scene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer,camera);

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
    const sphere1 = new SphereGeometry(5,20,16);
    const sphere2 = new SphereGeometry(3,20,16);
    const box = new BoxGeometry(4,4,4);

    const material = new MeshNormalMaterial();

    const sphere1Mesh = new Mesh(sphere1,material);
    const sphere2Mesh = new Mesh(sphere2,material);
    const boxMesh = new Mesh(box,material);

    sphere1Mesh.position.set(-6,0,0)
    sphere2Mesh.position.set(4,0,0)
    scene.add(sphere1Mesh,sphere2Mesh,boxMesh);

    console.log(scene);



    //// GUI

    const controls = {
      material,
      sphere1Mesh,
      sphere2Mesh,
      boxMesh,
      
      sphere1:{
        positionX:sphere1Mesh.position.x,
        positionY:sphere1Mesh.position.y,
        positionZ:sphere1Mesh.position.z,
      },
      sphere2:{
        positionX:sphere2Mesh.position.x,
        positionY:sphere2Mesh.position.y,
        positionZ:sphere2Mesh.position.z,
      },
      box:{
        positionX:boxMesh.position.x,
        positionY:boxMesh.position.y,
        positionZ:boxMesh.position.z,
      },

      operation:none,
      // function
      redraw(){
        if(this.sphere1Mesh) scene.remove(this.sphere1Mesh);
        if(this.sphere2Mesh) scene.remove(this.sphere2Mesh);
        if(this.boxMesh) scene.remove(this.boxMesh);
        this.sphere1Mesh = new Mesh(sphere1,material);
        this.sphere2Mesh = new Mesh(sphere2,material);
        this.boxMesh = new Mesh(box,material);
        scene.add(this.sphere1Mesh,this.boxMesh,this.sphere2Mesh);
        this.sphere1Mesh.position.set(this.sphere1.positionX,this.sphere1.positionY,this.sphere1.positionZ);
        this.sphere2Mesh.position.set(this.sphere2.positionX,this.sphere2.positionY,this.sphere2.positionZ);
        this.boxMesh.position.set(this.box.positionX,this.box.positionY,this.box.positionZ);
      },
      showResult(){}
    }

    const gui = new dat.GUI();
    console.log(gui);
    const sphere1Folder = gui.addFolder('sphere1');
    sphere1Folder.open();
    sphere1Folder.add(controls.sphere1,'positionX',-20,20,0.01).onChange(e=>{controls.redraw()});
    sphere1Folder.add(controls.sphere1,'positionY',-20,20,0.01).onChange(e=>{controls.redraw()});
    sphere1Folder.add(controls.sphere1,'positionZ',-20,20,0.01).onChange(e=>{controls.redraw()});
    
    const sphere2Folder = gui.addFolder('sphere2');
    sphere2Folder.open();
    sphere2Folder.add(controls.sphere2,'positionX',-20,20,0.01).onChange(e=>{controls.redraw()});
    sphere2Folder.add(controls.sphere2,'positionY',-20,20,0.01).onChange(e=>{controls.redraw()});
    sphere2Folder.add(controls.sphere2,'positionZ',-20,20,0.01).onChange(e=>{controls.redraw()});

    const boxFolder = gui.addFolder('box');
    boxFolder.open();
    boxFolder.add(controls.box,'positionX',-20,20,0.01).onChange(e=>{controls.redraw()});
    boxFolder.add(controls.box,'positionY',-20,20,0.01).onChange(e=>{controls.redraw()});
    boxFolder.add(controls.box,'positionZ',-20,20,0.01).onChange(e=>{controls.redraw()});

    gui.add(controls,'operation',{none,subtract,union,intersect})
    gui.add(controls,'showResult')


    const materialFolder = gui.addFolder('material');
    materialFolder.open();
    materialFolder.add(controls.material,'wireframe');


    function none() {
      
    }

    function subtract() {
      
    }

    function union() {
      
    }

    function intersect() {
      
    }
  }