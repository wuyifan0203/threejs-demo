/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2024-02-01 17:30:00
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 13:30:03
 * @FilePath: /threejs-demo/src/texture/block.js
 */
import {
  TextureLoader,
  PerspectiveCamera,
  LoadingManager,
  PMREMGenerator,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  AmbientLight,
} from '../lib/three/three.module.js';
import { EXRLoader } from '../lib/three/EXRLoader.js';
import { ViewHelper } from '../lib/three/viewHelper.js';
import {
  initOrbitControls,
  initProgress,
  initRenderer,
  initDirectionLight,
  initScene,
  resize
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
  const scene = initScene();
  renderer.setClearColor(0xffffff);

  const dom = document.querySelector('#webgl-output');
  const progress = initProgress()
  dom.appendChild(progress);

  progress.setText('666');
  progress.setProgress(20);

  const plane = new Mesh(new PlaneGeometry(100, 100, 1000, 1000), new MeshStandardMaterial())
  plane.rotateX(-Math.PI / 2)

  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const controls = initOrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  scene.add(new AmbientLight());
  const light = initDirectionLight();

  scene.add(light);

  const loader = new LoadingManager();

  loader.onProgress = (url, itemsLoaded, itemsTotal) => {
    progress.setProgress(itemsLoaded / itemsTotal * 100)
    progress.setText(url);

    if (itemsLoaded / itemsTotal === 1) {
      progress.hide();
    }
  }


  const textureLoader = new TextureLoader(loader);

  const exrLoader = new EXRLoader(loader);


  textureLoader.load(url.color, (texture) => {
    plane.material.map = texture;
    plane.material.needsUpdate = true;
  }),
    textureLoader.load(url.displacement, (texture) => {
      plane.material.displacementMap = texture;
      plane.material.displacementScale = 5;
      plane.material.displacementBias = 0;
      plane.material.needsUpdate = true;
    }),
    exrLoader.load(url.normal, (textureData) => {
      const target = pmremGenerator.fromEquirectangular(textureData);
      plane.material.normalMap = target.texture;
      plane.material.needsUpdate = true;
    }),
    exrLoader.load(url.roughness, (textureData) => {
      const target = pmremGenerator.fromEquirectangular(textureData);
      plane.material.roughnessMap = target.texture;
      plane.roughness = 0;
      plane.material.needsUpdate = true;
    }),


    scene.add(plane)

  function render() {
    controls.update();
    renderer.clear();
    light.position.copy(camera.position);
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    requestAnimationFrame(render);
  }
  render();
  resize(renderer, camera)
}
