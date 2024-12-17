/*
 * @Date: 2023-07-25 16:53:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 17:07:31
 * @FilePath: /threejs-demo/src/material/blendingTest.js
 */
import {
  Vector3,
  Mesh,
  AmbientLight,
  BoxGeometry,
  PointLight,
  MeshStandardMaterial,
  NoBlending,
  NormalBlending,
  AdditiveBlending,
  SubtractiveBlending,
  MultiplyBlending,
  FrontSide, BackSide, DoubleSide
} from 'three';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initCustomGrid,
  initOrbitControls,
  initGUI,
  initScene
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.setClearColor(0xefefef);

  const camera = initOrthographicCamera(new Vector3(100, 100, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const scene = initScene();
  initCustomGrid(scene);

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

  scene.add(camera);
  camera.add(pointLight);

  const geometry = new BoxGeometry(4, 4, 2);

  const material1 = new MeshStandardMaterial({color: 0xffff00});
  const material2 = new MeshStandardMaterial({color: 0x0000ff});
 
  const m1 = new Mesh(geometry, material1);
  m1.position.set(-2, 0, 0);
  const m2 = new Mesh(geometry, material2);
  m1.position.set(2, 0, 0);

  scene.add(m1, m2);

  function render() {
    renderer.clear();
    renderer.render(scene, camera);
    orbitControls.update();
    requestAnimationFrame(render);
  }
  render();

  resize(renderer, camera);

  const gui = initGUI();

  const of1 = gui.addFolder('object1');
  of1.addColor(material1,'color').onChange(update);

  of1.add(material1,'transparent').onChange(update);

  of1.add(material1,'opacity',0,1,0.1).onChange(update);

  of1.add(material1,'blending',{
    NoBlending,
    NormalBlending,
    AdditiveBlending,
    SubtractiveBlending,
    MultiplyBlending,
  }).onChange(update);

  of1.add(material1,'side',{FrontSide, BackSide, DoubleSide}).onChange(update);

  const of2 = gui.addFolder('object2');
  of2.addColor(material2,'color').onChange(update);

  of2.add(material2,'transparent').onChange(update);

  of2.add(material2,'opacity',0,1,0.1).onChange(update);

  of2.add(material2,'blending',{
    NoBlending,
    NormalBlending,
    AdditiveBlending,
    SubtractiveBlending,
    MultiplyBlending,
  }).onChange(update);

  of2.add(material2,'side',{FrontSide, BackSide, DoubleSide}).onChange(update);

  function update() {
    material1.needsUpdate = true;
    material2.needsUpdate = true;
    
  }
}
