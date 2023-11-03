/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-04-21 17:28:48
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-03 16:31:29
 * @FilePath: /threejs-demo/examples/src/texture/block.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Scene,
  TextureLoader,
  PerspectiveCamera,
  LoadingManager,
  PMREMGenerator,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight
} from '../lib/three/three.module.js';
import { EXRLoader } from '../lib/three/EXRLoader.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import {
  initOrbitControls, initProgress, initRenderer,
} from '../lib/tools/index.js';

const basePath = '../../public/images/block/rock_wall_';
const url = {
  color: `${basePath}diff.jpg`,
  displacement: `${basePath}disp.png`,
  normal: `${basePath}nor_gl.exr`,
  roughness: `${basePath}rough.exr`,
};



window.onload = async () => {
  init()
}


function init() {
  const renderer = initRenderer();
  renderer.autoClear = false;
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 200;
  camera.lookAt(0, 0, 0);
  const scene = new Scene();
  renderer.setClearColor(0xffffff);

  const dom = document.querySelector('#webgl-output');
  const progress = initProgress()
  dom.appendChild(progress);

  progress.setText('666');
  progress.setProgress(20);

  const plane = new Mesh(new PlaneGeometry(100,100,1000,1000),new MeshStandardMaterial())
  plane.rotateX(-Math.PI/2)

  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const controls = initOrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  scene.add(new AmbientLight());
  const light = new DirectionalLight();

  scene.add(light);

  const loader = new LoadingManager();

  loader.onProgress = (url, itemsLoaded, itemsTotal) => {
    progress.setProgress(itemsLoaded / itemsTotal * 100)
    progress.setText(url);

    if(itemsLoaded / itemsTotal === 1){
      progress.hide();
    }
  }


  const textureLoader = new TextureLoader(loader);

  const exrLoader = new EXRLoader(loader);


   textureLoader.load(url.color,(texture)=>{
    plane.material.map = texture;
    plane.material.needsUpdate = true;
   }),
    textureLoader.load(url.displacement,(texture)=>{
      plane.material.displacementMap = texture;
      plane.material.displacementScale = 5;
      plane.material.displacementBias = 0;
      plane.material.needsUpdate = true;
    }),
    exrLoader.load(url.normal,(textureData)=>{
      const target = pmremGenerator.fromEquirectangular(textureData);
      plane.material.normalMap = target.texture;
      plane.material.needsUpdate = true;
    }),
  exrLoader.load(url.roughness,(textureData)=>{
    const target = pmremGenerator.fromEquirectangular(textureData);
    plane.material.roughnessMap = target.texture;
    plane.roughness = 0;
    plane.material.needsUpdate = true;
  }),


  scene.add(plane)





  render();
  function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.clear();
    light.position.copy(camera.position);
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }
}
