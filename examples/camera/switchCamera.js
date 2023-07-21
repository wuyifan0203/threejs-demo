/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-05-15 16:41:42
 * @FilePath: /threejs-demo/packages/examples/camera/switchCamera.js
 */
import {
  Vector3,
  Scene,
  Mesh,
  MeshNormalMaterial,
  SphereGeometry,
  BoxGeometry,
} from '../../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
  initOrthographicCamera,
} from '../../lib/tools/index.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';
import dat from '../../lib/util/dat.gui.js';
import { EffectComposer } from '../../lib/three/EffectComposer.js';
import { RenderPass } from '../../lib/three/RenderPass.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const pcamera = initPerspectiveCamera(new Vector3(10, -10, 10));
  const scene = new Scene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  pcamera.up.set(0, 0, 1);
  initCustomGrid(scene, 100, 100);
  initAxesHelper(scene);

  const controls = new OrbitControls(pcamera, renderer.domElement);
  const viewHelper = new ViewHelper(pcamera, renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, pcamera);
  composer.addPass(renderPass);

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

  const pcamera1 = initPerspectiveCamera(new Vector3(20, 0, 0));
  pcamera1.up.set(0, 0, 1);

  const ocamera = initOrthographicCamera(new Vector3(10, -10, 10));
  ocamera.up.set(0, 0, 1);

  const ocamera1 = initOrthographicCamera(new Vector3(20, 0, 0));
  ocamera1.up.set(0, 0, 1);

  const controler = {
    p: {
      pcamera,
      pcamera1,
    },
    o: {
      ocamera,
      ocamera1,
    },
    type: 'p',
    current: '3D',
  };

  const gui = new dat.GUI();
  gui.width = 330;

  gui.add(controler, 'current', ['3D', 'XY', 'XZ', 'YZ']).name('Select View:').onChange(() => {
    switchCamera();
  });

  gui.add(controler, 'type', { PerspectiveCamera: 'p', OrthographicCamera: 'o' }).name('Camera Type:').onChange(() => {
    switchCamera();
  });

  const map = {
    XY: new Vector3(0, 0, 20),
    XZ: new Vector3(0, 20, 0),
    YZ: new Vector3(20, 0, 0),
  };

  function switchCamera() {
    let cameras; let camera;
    if (controler.type === 'p') {
      cameras = controler.p;
    } else {
      cameras = controler.o;
    }
    if (controler.current === '3D') {
      camera = cameras[`${controler.type}camera`];
      controls.enableRotate = true;
    } else {
      controls.enableRotate = false;
      camera = cameras[`${controler.type}camera1`];
      camera.position.copy(map[controler.current]);
      camera.updateProjectionMatrix();
    }
    controls.object = camera;
    controls.update();
    viewHelper.editorCamera = camera;
    renderPass.camera = camera;
  }

  resize(renderer, pcamera);
}
