/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2023-02-22 10:29:53
 * @FilePath: /threejs-demo/src/examples/booleanOperation/index.js
 */
import {
    Vector3,
    Scene,
    Mesh,
    MeshNormalMaterial,
    SphereGeometry,
    BoxGeometry,
    Matrix4,
  } from '../../lib/three/three.module.js';
  import {
    initRenderer,
    initPerspectiveCamera,
    createAxesHelper,
    initCustomGrid,
    resize,
  } from '../../lib/tools/index.js';
  import { OrbitControls } from '../../lib/three/OrbitControls.js';
  import { ViewHelper } from '../../lib/three/viewHelper.js';
  import dat from '../../lib/util/dat.gui.js';
  import { EffectComposer } from '../../lib/three/EffectComposer.js';
  import { RenderPass} from '../../lib/three/RenderPass.js'
  
  window.onload = () => {
    init();
  };
  
  function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
    const scene = new Scene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);
    initCustomGrid(scene, 100, 100);
    createAxesHelper(scene);
  
    const controls = new OrbitControls(camera, renderer.domElement);
    const viewHelper = new ViewHelper(camera, renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass =  new RenderPass(scene, camera);
    composer.addPass(renderPass)
  
  
    render();
    function render() {
      renderer.clear();
      controls.update();
      composer.render();
      viewHelper.render(renderer);
      requestAnimationFrame(render);
    }

    const sphere1 = new SphereGeometry(5, 20, 16);
    const sphere2 = new SphereGeometry(3, 20, 16);
    const box = new BoxGeometry(4, 4, 4);
  
    const material = new MeshNormalMaterial({ wireframe: true });
  
    const sphere1Mesh = new Mesh(sphere1, material);
    const sphere2Mesh = new Mesh(sphere2, material);
    const boxMesh = new Mesh(box, material);
  
    sphere1Mesh.position.set(-6, 0, 0);
    sphere2Mesh.position.set(4, 0, 0);
    scene.add(sphere1Mesh, sphere2Mesh, boxMesh);

    const camera2 = initPerspectiveCamera(new Vector3(100,0,0));
    camera2.up.set(0,0,1)

    const controler = {
        camera,
        camera2,
        current:'3D'
    }

    const gui = new dat.GUI();

    gui.add(controler,'current',['3D','XY','XZ','YZ']).onChange(e=>{
        console.log(e);
        switchCamera(e)
    })


    const map = {
      'XY':new Vector3(0,0,100),
      'XZ':new Vector3(0,100,0),
      'YZ':new Vector3(100,0,0)
    }



    function switchCamera(e) {
      let camera
      if(e==='3D'){
        camera = controler.camera;
      }else{
        camera = controler.camera2;
        camera.position.copy(map[e])
      }
        controls.object = camera;
        controls.update();
        viewHelper.editorCamera = camera;
    //    composer.render() 
    renderPass.camera = camera;
    }





  }
  
