/*
 * @Date: 2023-11-05 15:56:16
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-06 01:33:45
 * @FilePath: /threejs-demo/examples/src/material/transport.js
 */
import {
    Scene,
    Vector3,
    Mesh,
    AmbientLight,
    AdditiveBlending,
    PointLight,
    CylinderGeometry,
    MeshBasicMaterial,
    TextureLoader,
    TorusGeometry,
    Group
  } from '../lib/three/three.module.js';
  import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initCustomGrid,
    initOrbitControls,
    initGUI,
    initGroundPlane
  } from '../lib/tools/index.js';
  
  window.onload = () => {
    init();
  };
  
  function init() {
    const renderer = initRenderer();
    renderer.setClearColor(0x000000);
    renderer.setAnimationLoop(render);
  
    const camera = initOrthographicCamera(new Vector3(100, 100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
  
    const orbitControls = initOrbitControls(camera, renderer.domElement);
  
    const scene = new Scene();
    const plane = initGroundPlane(scene,{x:50,y:50});
    plane.material.color.setHex(0x121212);
  
    scene.add(new AmbientLight());
  
    const pointLight = new PointLight(0xffffff);
    pointLight.angle = Math.PI / 4;
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 1000;
    pointLight.intensity = 1;
    pointLight.position.set(100, 100, 100);

    scene.add(pointLight);
  
 
  
    resize(renderer, camera);

    const base = '../../public/images/transport/';

    const path = {
        pillar:`${base}pillar.png`,
        swirl:`${base}swirl.png`,
        ground:`${base}ground.png`,
        particle:`${base}particle.png`,
        ball:`${base}ball.png`,
    }

    const loader = new TextureLoader();

    const transport = new Group();
  


    const geometry = new CylinderGeometry(5,5,15,25,25,true);
    const material = new MeshBasicMaterial({
        color: 0x007eff,
        transparent:true,
        blending:AdditiveBlending,
        side:2,
        map:loader.load(path.pillar),
        depthWrite:false
    });

    const cylinder = new Mesh(geometry, material);
    cylinder.rotateX(Math.PI/2);
    cylinder.position.set(0,0,8);
    transport.add(cylinder);

    const geometry2 = new TorusGeometry(7,3,2,100);
    const material2 = new MeshBasicMaterial({
        color: 0x007eff,
        map: loader.load(path.swirl),
        transparent: true,
        blending: AdditiveBlending,
        opacity: 1,
      });

      const swirl = new Mesh(geometry2, material2);
      swirl.position.set(0,0,0.01);
      transport.add(swirl);
    
      scene.add(transport);

      function render(t) {
        renderer.clear();
        renderer.render(scene, camera);
        orbitControls.update();

        swirl.rotateZ(t * 0.00001);
        swirl.material.opacity = Math.abs(0.7 - 0.3 * Math.sin(t * 0.01));
      }
  
    const gui = initGUI();
  
  

 
  }
  