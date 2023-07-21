/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-31 17:28:31
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
  initAxesHelper,
  initCustomGrid,
  resize,
} from '../../lib/tools/index.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { ViewHelper } from '../../lib/three/viewHelper.js';
import dat from '../../lib/util/dat.gui.js';
import { CSG } from '../../lib/other/CSGMesh.js';

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
  initAxesHelper(scene);

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
  const sphere1 = new SphereGeometry(5, 20, 16);
  const sphere2 = new SphereGeometry(3, 20, 16);
  const box = new BoxGeometry(4, 4, 4);

  const material = new MeshNormalMaterial({ wireframe: true });
  const resultMaterial = new MeshNormalMaterial();

  const sphere1Mesh = new Mesh(sphere1, material);
  const sphere2Mesh = new Mesh(sphere2, material);
  const boxMesh = new Mesh(box, material);

  sphere1Mesh.position.set(-6, 0, 0);
  sphere2Mesh.position.set(4, 0, 0);
  scene.add(sphere1Mesh, sphere2Mesh, boxMesh);

  /// / GUI

  const controls = {
    material,
    resultMaterial,
    sphere1Mesh,
    sphere2Mesh,
    boxMesh,

    sphere1: {
      positionX: sphere1Mesh.position.x,
      positionY: sphere1Mesh.position.y,
      positionZ: sphere1Mesh.position.z,
      operationWithBox: 'none',
    },
    sphere2: {
      positionX: sphere2Mesh.position.x,
      positionY: sphere2Mesh.position.y,
      positionZ: sphere2Mesh.position.z,
      operationWithBox: 'none',
    },
    box: {
      positionX: boxMesh.position.x,
      positionY: boxMesh.position.y,
      positionZ: boxMesh.position.z,
    },
    // function
    redraw() {
      sphere1Mesh.position.set(this.sphere1.positionX, this.sphere1.positionY, this.sphere1.positionZ);
      sphere2Mesh.position.set(this.sphere2.positionX, this.sphere2.positionY, this.sphere2.positionZ);
      boxMesh.position.set(this.box.positionX, this.box.positionY, this.box.positionZ);
      const func1 = this.sphere1.operationWithBox;
      const func2 = this.sphere2.operationWithBox;
      // eslint-disable-next-line no-unused-expressions
      func1 !== 'none' && this[func1]('sphere1');
      // eslint-disable-next-line no-unused-expressions
      func2 !== 'none' && this[func2]('sphere2');
    },

    showResult() {
      if (!this.finalCSG) return;
      if (this.finalMesh) scene.remove(this.finalMesh);
      const mesh = CSG.toMesh(this.finalCSG, new Matrix4());
      mesh.material = resultMaterial;
      this.finalMesh = mesh;
      scene.add(mesh);
    },

    none(target) {
      let func = '';
      if (target === 'sphere1') {
        func = this.sphere2.operationWithBox;
        this[func]('sphere2');
      } else {
        func = this.sphere1.operationWithBox;
        this[func]('sphere1');
      }
    },

    subtract(target) {
      const key = `${target}Mesh`;
      const csg = CSG.fromMesh(this[key]);
      const boxCSG = CSG.fromMesh(this.boxMesh);
      let finalCSG = boxCSG.subtract(csg);
      if (this.finalCSG) {
        finalCSG = finalCSG.subtract(this.finalCSG);
      }
      this.finalCSG = finalCSG;
    },

    union(target) {
      const key = `${target}Mesh`;
      const csg = CSG.fromMesh(this[key]);
      const boxCSG = CSG.fromMesh(this.boxMesh);
      let finalCSG = boxCSG.union(csg);
      if (this.finalCSG) {
        finalCSG = finalCSG.union(this.finalCSG);
      }
      this.finalCSG = finalCSG;
    },

    intersect(target) {
      const key = `${target}Mesh`;
      const csg = CSG.fromMesh(this[key]);
      const boxCSG = CSG.fromMesh(this.boxMesh);
      let finalCSG = boxCSG.intersect(csg);
      if (this.finalCSG) {
        finalCSG = finalCSG.intersect(this.finalCSG);
      }
      this.finalCSG = finalCSG;
    },
  };

  const gui = new dat.GUI();
  console.log('有时候选none会栈溢出。是正常现象，因为我没有修');
  const sphere1Folder = gui.addFolder('sphere1');
  sphere1Folder.open();
  sphere1Folder.add(controls.sphere1, 'positionX', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphere1Folder.add(controls.sphere1, 'positionY', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphere1Folder.add(controls.sphere1, 'positionZ', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphere1Folder.add(controls.sphere1, 'operationWithBox', ['none', 'subtract', 'union', 'intersect']).onChange((e) => {
    controls[e]('sphere1');
  });

  const sphere2Folder = gui.addFolder('sphere2');
  sphere2Folder.open();
  sphere2Folder.add(controls.sphere2, 'positionX', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphere2Folder.add(controls.sphere2, 'positionY', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphere2Folder.add(controls.sphere2, 'positionZ', -20, 20, 0.01).onChange(() => { controls.redraw(); });
  sphere2Folder.add(controls.sphere2, 'operationWithBox', ['none', 'subtract', 'union', 'intersect']).onChange((e) => {
    controls[e]('sphere2');
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
}
