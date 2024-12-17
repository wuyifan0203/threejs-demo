/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-18 19:50:31
 * @FilePath: /threejs-demo/src/booleanOperation/3d.js
 */
import {
  Vector3,
  Mesh,
  MeshNormalMaterial,
  SphereGeometry,
  BoxGeometry,
  Matrix4,
} from 'three';
import { ViewHelper } from '../lib/three/viewHelper.js';
import { CSG } from '../lib/other/CSGMesh.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  initCustomGrid,
  resize,
  initScene,
  initGUI,
  initOrbitControls,
} from '../lib/tools/index.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = initScene();

  renderer.autoClear = false;
  camera.up.set(0, 0, 1);

  resize(renderer, camera);
  initCustomGrid(scene, 100, 100);
  initAxesHelper(scene);

  const orbitControl = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  (function render() {
    renderer.clear();
    orbitControl.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
    
    requestAnimationFrame(render)
  })()


  const sphere = new SphereGeometry(3, 20, 16);
  const box = new BoxGeometry(4, 4, 4);

  const material = new MeshNormalMaterial({ wireframe: true });
  const resultMaterial = new MeshNormalMaterial();

  const sphereMesh = new Mesh(sphere, material);
  sphereMesh.position.set(0, 0, 0);
  const boxMesh = new Mesh(box, material);


  scene.add(sphereMesh, boxMesh);

  /// / GUI

  const controls = {
    material,
    resultMaterial,
    sphereMesh,
    boxMesh,

    sphere: {
      positionX: sphereMesh.position.x,
      positionY: sphereMesh.position.y,
      positionZ: sphereMesh.position.z,
      operationWithBox: 'intersect',
    },
    box: {
      positionX: boxMesh.position.x,
      positionY: boxMesh.position.y,
      positionZ: boxMesh.position.z,
    },
    // function
    redraw() {
      sphereMesh.position.set(this.sphere.positionX, this.sphere.positionY, this.sphere.positionZ);
      boxMesh.position.set(this.box.positionX, this.box.positionY, this.box.positionZ);
      const func = this.sphere.operationWithBox;

      func !== 'none' && this[func]();
    },

    showResult() {
      if (!this.finalCSG) return;
      if (this.finalMesh) scene.remove(this.finalMesh);
      const mesh = CSG.toMesh(this.finalCSG, new Matrix4());
      mesh.material = resultMaterial;
      this.finalMesh = mesh;
      scene.add(mesh);
    },

    none() {
      let func = '';
        func = this.sphere.operationWithBox;
        this[func]();
    },

    subtract() {
      const csg = CSG.fromMesh(sphereMesh);
      const boxCSG = CSG.fromMesh(boxMesh);
      this.finalCSG = boxCSG.subtract(csg);
    },

    union() {
      const csg = CSG.fromMesh(sphereMesh);
      const boxCSG = CSG.fromMesh(boxMesh);
      this.finalCSG = boxCSG.union(csg);
    },

    intersect() {
      const csg = CSG.fromMesh(sphereMesh);
      const boxCSG = CSG.fromMesh(boxMesh);
      this.finalCSG = boxCSG.intersect(csg);
    },
  };

  const gui = initGUI();

  const sphereFolder = gui.addFolder('sphere');
  sphereFolder.open();
  sphereFolder.add(controls.sphere, 'positionX', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphereFolder.add(controls.sphere, 'positionY', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphereFolder.add(controls.sphere, 'positionZ', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphereFolder.add(controls.sphere, 'operationWithBox', ['none', 'subtract', 'union', 'intersect']).onChange((e) => {
    controls[e]();
  });

  const boxFolder = gui.addFolder('box');
  boxFolder.open();
  boxFolder.add(controls.box, 'positionX', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  boxFolder.add(controls.box, 'positionY', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  boxFolder.add(controls.box, 'positionZ', -20, 20, 0.01).onChange(() => { controls.redraw(); });

  gui.add(controls, 'showResult');

  const materialFolder = gui.addFolder('material');
  materialFolder.open();
  materialFolder.add(controls.material, 'wireframe');
  materialFolder.add(controls.material, 'visible');

  const resultMaterialFolder = gui.addFolder('Result Material');
  resultMaterialFolder.open();
  resultMaterialFolder.add(controls.resultMaterial, 'wireframe');
  resultMaterialFolder.add(controls.resultMaterial, 'visible');
  
  controls.redraw();
  controls.showResult()
}
