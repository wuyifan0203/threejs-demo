import { GLTFLoader } from '../lib/three/GLTFLoader.js';
import {
  Mesh,
  BufferGeometry,
  Vector3,
  BufferAttribute,
  BoxGeometry,
  MeshLambertMaterial,
  Matrix4,
  Euler,
  Quaternion,
  Points,
  PointsMaterial,
  PlaneHelper,
  Plane,
  MeshNormalMaterial,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  initCustomGrid,
  initAxesHelper,
  rotationFormula,
  createMirrorMatrix,
  initScene,
  initOrbitControls,
  initSpotLight,
  initAmbientLight,
  initDirectionLight,
  initTransformControls,
  initGUI,
  resize
} from '../lib/tools/index.js';
import { generateMirrorModalMatrix } from '../lib/tools/func.js'


window.onload = function () {
  init();
}

async function init() {
  const renderer = initRenderer();

  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.up.set(0, 0, 1);
  const scene = initScene();

  const light = initDirectionLight();
  light.position.set(40, 40, 70);
  scene.add(light);

  const modelLoader = new GLTFLoader();
  const path = '../../public/models/';
  const model = await modelLoader.loadAsync(`${path}rubber_duck_toy/rubber_duck_toy_1k.gltf`);
  const modelMesh = model.scene.children[0];
  modelMesh.castShadow = true;
  modelMesh.rotateX(Math.PI / 2);
  modelMesh.scale.set(10, 10, 10)
  scene.add(modelMesh);

  console.log(modelMesh);

  const mirrorMesh = modelMesh.clone();
  mirrorMesh.geometry = mirrorMesh.geometry.clone();
  reverseWindingOrder(mirrorMesh.geometry);
  mirrorMesh.material = new MeshNormalMaterial({ wireframe: true, side: 2 });
  scene.add(mirrorMesh);

  const options = {
    target: modelMesh,
    plane: {
      a: 1,
      b: 0,
      c: 0,
      d: 3
    }
  }

  const mirrorMatrix = new Matrix4();
  const planeNormal = new Vector3()

  const gui = initGUI();

  initAmbientLight(scene);
  initCustomGrid(scene);
  initAxesHelper(scene);


  const plane = new Plane();
  const planeHelper = new PlaneHelper(plane, 10);
  scene.add(planeHelper);
  updatePlane();

  const controls = initOrbitControls(camera, renderer.domElement);
  function render() {
    controls.update();
    light.position.copy(camera.position);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
  resize(renderer, camera);


  const planeFolder = gui.addFolder('Ax + By + Cz + D = 0');
  planeFolder.add(options.plane, 'a', -10, 10, 0.1).name('A').onChange(updatePlane);
  planeFolder.add(options.plane, 'b', -10, 10, 0.1).name('B').onChange(updatePlane);
  planeFolder.add(options.plane, 'c', -10, 10, 0.1).name('C').onChange(updatePlane);
  planeFolder.add(options.plane, 'd', -10, 10, 0.1).name('D').onChange(updatePlane);


  function updatePlane() {
    planeNormal.set(options.plane.a, options.plane.b, options.plane.c).normalize();
    plane.setComponents(planeNormal.x, planeNormal.y, planeNormal.z, options.plane.d);
    planeHelper.updateMatrixWorld();
    updateMirrorMesh()
  }

  function updateMirrorMesh() {
    generateMirrorModalMatrix(plane.normal, plane.constant, mirrorMatrix);
    console.log(mirrorMatrix);
    mirrorMesh.applyMatrix4(mirrorMatrix);
    mirrorMesh.updateMatrixWorld();
  }
}

function reverseWindingOrder(geometry) {
  // 判断几何体是否有索引
  const index = geometry.getIndex();
  if (index) {
    // 翻转索引
    const array = index.array;
    for (let i = 0; i < array.length; i += 3) {
      const temp = array[i + 1];
      array[i + 1] = array[i + 2];
      array[i + 2] = temp;
    }
  } else {
    // 翻转无索引的几何体
    const position = geometry.getAttribute('position');
    if (position) {
      const posArray = position.array;
      for (let i = 0; i < posArray.length; i += 9) {
        for (let j = 0; j < 3; j++) {
          const temp = posArray[i + 3 + j];
          posArray[i + 3 + j] = posArray[i + 6 + j];
          posArray[i + 6 + j] = temp;
        }
      }
    }
  }

  // // 翻转法线（如果存在）
  // const normal = geometry.getAttribute('normal');
  // if (normal) {
  //   const normalArray = normal.array;
  //   for (let i = 0; i < normalArray.length; i += 9) {
  //     for (let j = 0; j < 3; j++) {
  //       const temp = normalArray[i + 3 + j];
  //       normalArray[i + 3 + j] = normalArray[i + 6 + j];
  //       normalArray[i + 6 + j] = temp;
  //     }
  //   }
  // }

  // 翻转 UV（如果存在）
  const uv = geometry.getAttribute('uv');
  if (uv) {
    const uvArray = uv.array;
    for (let i = 0; i < uvArray.length; i += 6) {
      for (let j = 0; j < 2; j++) {
        const temp = uvArray[i + 2 + j];
        uvArray[i + 2 + j] = uvArray[i + 4 + j];
        uvArray[i + 4 + j] = temp;
      }
    }
  }

  // 翻转顶点颜色（如果存在）
  const color = geometry.getAttribute('color');
  if (color) {
    const colorArray = color.array;
    for (let i = 0; i < colorArray.length; i += 9) {
      for (let j = 0; j < 3; j++) {
        const temp = colorArray[i + 3 + j];
        colorArray[i + 3 + j] = colorArray[i + 6 + j];
        colorArray[i + 6 + j] = temp;
      }
    }
  }
}
