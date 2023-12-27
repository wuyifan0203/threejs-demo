/*
 * @Date: 2023-05-08 17:17:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 17:58:25
 * @FilePath: /threejs-demo/src/tween/useTween.js
 */
import {
  AmbientLight,
  BoxGeometry,
  Mesh,
  MeshLambertMaterial,
  PointLight,
  Vector3,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initOrthographicCamera,
  resize,
  initCustomGrid,
  initScene,
  initOrbitControls
} from '../lib/tools/index.js';
import {
  Tween, update, Easing,
} from '../lib/other/tween.esm.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  const camera = initOrthographicCamera(new Vector3(30, -30, 30));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const scene = initScene();
  scene.add(new AmbientLight());
  const light = new PointLight();
  light.position.set(10, 10, 10);
  scene.add(light);

  initCustomGrid(scene);

  const orbitControls = initOrbitControls(camera, renderer.domElement);

  const createMaterial = (color) => new MeshLambertMaterial({ color });

  const geometry = new BoxGeometry(1, 1, 1);
  const mesh_test_to = new Mesh(geometry, createMaterial('green'));
  const mesh_test_delay = new Mesh(geometry, createMaterial('red'));

  scene.add(mesh_test_to);
  scene.add(mesh_test_delay);

  useTo(mesh_test_to);
  useDelay(mesh_test_delay);

  resize(renderer, camera);

  function render() {
    orbitControls.update();
    update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);
}

function useTo(mesh) {
  const tween = new Tween({ x: -10 });
  const tween2 = new Tween({ x: 10 });

  tween.to({ x: 10 }, 2000);
  tween2.to({ x: -10 }, 2000);

  const tweenUpdate = (obj) => {
    mesh.position.x = obj.x;
  };

  tween.onUpdate(tweenUpdate);

  tween2.onUpdate(tweenUpdate);

  tween.chain(tween2);
  tween2.chain(tween);

  tween.start();
}

function useDelay(mesh) {
  const tween = new Tween({ z: -10 });
  const tween2 = new Tween({ z: 10 });

  tween.to({ z: 10 }, 1000);
  tween2.easing(Easing.Elastic.InOut);
  tween.delay(2000);

  tween2.to({ z: -10 }, 1000);
  tween2.easing(Easing.Elastic.InOut);
  tween2.delay(2000);

  const tweenUpdate = (obj) => {
    mesh.position.z = obj.z;
  };

  tween.onUpdate(tweenUpdate);
  tween2.onUpdate(tweenUpdate);

  tween.chain(tween2);
  tween2.chain(tween);

  tween.start();
}
