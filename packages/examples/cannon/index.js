/* eslint-disable no-unused-vars */
/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-02 20:59:35
 * @FilePath: /threejs-demo/packages/examples/cannon/index.js
 */
import {
  Scene,
  Mesh,
  MeshBasicMaterial,
  BackSide,
  PerspectiveCamera,
  Sprite,
  SpriteMaterial,
  Raycaster,
  Clock,
  SphereGeometry,
  Vector3,
  MeshPhongMaterial,
  PlaneGeometry,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';
import { initRenderer, initOrthographicCamera, initDefaultLighting } from '../../lib/tools/index.js';
import {
  World, Sphere, Body, Vec3, Material, ContactMaterial, Plane,
} from '../../lib/other/physijs/cannon.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({ logarithmicDepthBuffer: true });
  renderer.setClearColor(0xffffff);
  const camera = initOrthographicCamera(new Vector3(0, 10000, 1000));

  const orbitControl = new OrbitControls(camera, renderer.domElement);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);

  const scene = new Scene();
  initDefaultLighting(scene, new Vector3(0, 0, 30));
  const sphereGeometry = new SphereGeometry(10);
  const ThreeMaterial = new MeshBasicMaterial({ color: 0xff0000, side: 2 });
  const mesh = new Mesh(sphereGeometry, ThreeMaterial);
  mesh.position.set(0, 0, 50);
  scene.add(mesh);

  const world = new World();
  world.gravity.set(0, 9.82, 0);

  const sphereShape = new Sphere(2);
  const defaultMaterial = new Material('default');
  const body = new Body({
    mass: 1,
    shape: sphereShape,
    position: new Vec3(0, 0, 50),
    material: defaultMaterial,
  });
  world.addBody(body);

  const defaultContactMaterial = new ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0,
  });

  world.addContactMaterial(defaultContactMaterial);

  const planeMesh = new Mesh(new PlaneGeometry(100, 100), new MeshBasicMaterial({ color: 0x444444, side: 2 }));
  planeMesh.rotateZ(Math.PI / 2);

  scene.add(planeMesh);

  const planeShape = new Plane();
  const planeBody = new Body({
    mass: 0,
    shape: planeShape,
    material: defaultMaterial,
  });

  planeBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
  world.addBody(planeBody);

  const clock = new Clock();
  function render() {
    world.step(1 / 60, clock.getDelta());

    mesh.position.copy(body.position);
    orbitControl.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  window.scene = scene;
  window.camera = camera;
}
