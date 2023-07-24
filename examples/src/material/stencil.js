import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  Scene,
  Vector3,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  SpotLight,
  BoxGeometry,
  MeshBasicMaterial,
  ReplaceStencilOp,
  NotEqualStencilFunc,
  AlwaysStencilFunc,
  KeepStencilOp,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initCustomGrid,
} from '../lib/tools/index.js';

import { GUI } from '../lib/util/lil-gui.module.min.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  renderer.setClearColor(0xefefef);
  renderer.shadowMap.enabled = true;

  console.log(renderer);

  const camera = initOrthographicCamera(new Vector3(100, 100, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  const orbitControls = new OrbitControls(camera, renderer.domElement);

  const scene = new Scene();
  initCustomGrid(scene);

  scene.add(new AmbientLight());

  const spotLight = new SpotLight(0xffffff);
  spotLight.angle = Math.PI / 4;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.near = 0.1;
  spotLight.shadow.camera.far = 1000;
  spotLight.intensity = 0.8;

  camera.add(spotLight);
  scene.add(camera);

  const geometry = new BoxGeometry(2, 2, 2);
  const normalMaterial = new MeshPhongMaterial({ color: 0xbbbbbb });
  const faceMaterial = new MeshBasicMaterial({ color: 'orange' });

  const normalObject = new Mesh(geometry, normalMaterial);
  const faceObject = new Mesh(geometry, faceMaterial);

  scene.add(normalObject, faceObject);

  function render() {
    normalObject.rotation.x += 0.01;
    normalObject.rotation.y += 0.01;
    renderer.clear();
    renderer.render(scene, camera);

    renderer.state.buffers.stencil.setTest(true);
    renderer.state.buffers.stencil.setMask(0xff);
    renderer.state.buffers.stencil.setFunc(AlwaysStencilFunc, 1, 0xff);
    renderer.state.buffers.stencil.setOp(
      ReplaceStencilOp,
      ReplaceStencilOp,
      ReplaceStencilOp,
    );

    faceObject.scale.set(1.05, 1.05, 1.05);
    renderer.render(faceObject, camera);
    renderer.state.buffers.stencil.setFunc(NotEqualStencilFunc, 1, 0xff);
    renderer.state.buffers.stencil.setOp(
      KeepStencilOp,
      KeepStencilOp,
      KeepStencilOp,
    );

    faceObject.material = faceMaterial;

    renderer.render(faceObject, camera);

    renderer.state.buffers.stencil.setTest(false);
    orbitControls.update();
    requestAnimationFrame(render);
  }

  render();

  resize(renderer, camera);
}
