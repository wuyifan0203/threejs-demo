/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-28 17:06:45
 * @FilePath: /threejs-demo/src/examples/particle/canvasTexture.js
 */
import {
    Scene,
    TextureLoader,
    PerspectiveCamera,
    BufferGeometry,
    PointsMaterial,
    Float32BufferAttribute,
    Points,
    CanvasTexture,
  } from "../../lib/three/three.module.js";
  import { OrbitControls } from "../../lib/three/OrbitControls.js";
  import { ViewHelper } from "../../lib/three/viewHelper.js";
  import { initRenderer, resize } from "../../lib/tools/index.js";
  import datGui from "../../lib/util/dat.gui.js";
  
  import {Stats} from '../../lib/util/Stats.js'
  window.onload = () => {
    init();
  };
  
  function init() {
    const renderer = initRenderer();
  
    const stats = new Stats();
    stats.showPanel(0);
    document.getElementById('webgl-output').append(stats.dom)
    renderer.autoClear = false;
    const camera = new PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,10000);
    camera.position.set(3, 3, 63);
    camera.lookAt(10, 0, 0);
    const scene = new Scene();
    renderer.setClearColor(0xffffff);
  
    const controls = new OrbitControls(camera, renderer.domElement);
    const viewHelper = new ViewHelper(camera, renderer.domElement);
    draw(scene,renderer);
    resize(renderer, camera);
  
    render();
    function render() {
      stats.begin()
      controls.update();
      renderer.clear();
      renderer.render(scene, camera);
      viewHelper.render(renderer);
      stats.end()
      requestAnimationFrame(render);
    }
  
    window.camera = camera;
    window.scene = scene;
  }
  
  function draw(scene,renderer) {
    const canvas = createCanvasTexture();
    const image = createImageTexture();
    
    const material = new PointsMaterial({
        size: 10,
        // vertexColors: true,
        color: 0xffffff,
        map:canvas,
        depthTest: true,
        depthWrite: false,
        transparent: true,
    });
    const geometry = new BufferGeometry();
    const mesh = new Points(geometry, material);
    scene.add(mesh);



    const controls = {
        range:400,
        texture:'canvas',
        background:'#ffffff',
        sizeAttenuation:material.sizeAttenuation,
        size:material.size,
        image,
        canvas
     };

    function createParticlesByPoints() {
        const size = controls.range;
        const hs = size / 2;
        const vertexes = [];
        for (let x = 0; x < size; x++) {
          vertexes.push(size * Math.random() - hs, size * Math.random() - hs, size * Math.random() - hs);
        }
        geometry.setAttribute('position',new Float32BufferAttribute(vertexes, 3));
    }

    createParticlesByPoints();

    function createCanvasTexture(){
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 300
        canvas.height = 300
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(170, 120);
        const grd = ctx.createLinearGradient(0, 0, 170, 0);
        grd.addColorStop('0', 'black');
        grd.addColorStop('0.3', 'magenta');
        grd.addColorStop('0.5', 'blue');
        grd.addColorStop('0.6', 'green');
        grd.addColorStop('0.8', 'yellow');
        grd.addColorStop(1, 'red');
        ctx.strokeStyle = grd;
        ctx.arc(120, 120, 50, 0, Math.PI * 2);
        ctx.stroke();
        const texture = new CanvasTexture(canvas)
        texture.needsUpdate = true
        return texture
    }

    function createImageTexture() {
        const url = '../../resources/texture/others/heart.png'
        const loader = new TextureLoader();
       return loader.load(url)
    }

    // GUI

    const gui = new datGui.GUI();
    gui.add(controls, "range", 1, 1000, 1).onChange((e) => {createParticlesByPoints();});
    gui.add(controls, "size", 1, 30, 0.1).onChange((e) => {
        material.size = e
    });
    gui.add(controls, "texture", ['canvas','image']).onChange((e) => {
        material.map = controls[e]
    });
    gui.add(controls, "sizeAttenuation").onChange((e) => {material.sizeAttenuation = e});
    gui.addColor(controls,'background').onChange(e=>{
        renderer.setClearColor(e)
    })
  }
  