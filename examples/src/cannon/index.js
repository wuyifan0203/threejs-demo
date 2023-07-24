/* eslint-disable camelcase */
/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-06 17:51:47
 * @FilePath: /threejs-demo/packages/examples/cannon/index.js
 */
import {
  Scene,
  Mesh,
  Clock,
  SphereGeometry,
  Vector3,
  MeshPhongMaterial,
  PlaneGeometry,
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
  initRenderer, initOrthographicCamera, initDefaultLighting,
} from '../lib/tools/index.js';
import {
  World, Sphere, Body, Material, ContactMaterial, Plane, NaiveBroadphase,
} from '../lib/other/physijs/cannon.js';

import { GUI } from '../lib/util/lil-gui.module.min.js';

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({});
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0xffffff);
  const camera = initOrthographicCamera(new Vector3(-500, 1100, 700));
  camera.zoom = 0.13;
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();
  const scene = new Scene();
  initDefaultLighting(scene, new Vector3(40, 40, 70));
  const orbitControl = new OrbitControls(camera, renderer.domElement);

  // constant
  const sphereSize = 2;
  const mass = 10;

  // three
  const mesh1 = new Mesh(new SphereGeometry(sphereSize), new MeshPhongMaterial({ color: 0xff0000, side: 0 }));
  mesh1.position.set(0, 0, 50);
  mesh1.castShadow = true;

  const mesh2 = new Mesh(new SphereGeometry(sphereSize), new MeshPhongMaterial({ color: 0xd8ef8e, side: 0 }));
  mesh2.position.set(10, 0, 50);
  mesh2.castShadow = true;

  const mesh3 = new Mesh(new SphereGeometry(sphereSize), new MeshPhongMaterial({ color: 0xf1d377, side: 0 }));
  mesh3.position.set(-10, 0, 50);
  mesh3.castShadow = true;

  const planeMesh = new Mesh(new PlaneGeometry(150, 150), new MeshPhongMaterial({ color: 'gray', side: 0 }));
  planeMesh.receiveShadow = true;
  planeMesh.rotateZ(Math.PI / 2);

  scene.add(mesh1);
  scene.add(mesh2);
  scene.add(mesh3);
  scene.add(planeMesh);

  // cannon

  const world = new World();
  world.gravity.set(0, 0, -9.8);
  world.broadphase = new NaiveBroadphase();
  world.defaultContactMaterial.contactEquationRelaxation = 5;
  world.defaultContactMaterial.contactEquationStiffness = 1e7;

  const sphereShape = new Sphere(sphereSize);

  const sphere1Body = new Body({ mass });
  sphere1Body.addShape(sphereShape);
  sphere1Body.position.set(0, 0, 50);
  sphere1Body.material = new Material({ restitution: 1 });

  const sphere2Body = new Body({ mass });
  sphere2Body.addShape(sphereShape);
  sphere2Body.position.set(10, 0, 50);
  sphere2Body.material = new Material({ restitution: 1 });

  const sphere3Body = new Body({ mass });
  sphere3Body.addShape(sphereShape);
  sphere3Body.position.set(-10, 0, 50);
  sphere3Body.material = new Material({ restitution: 1 });

  const planeShape = new Plane();
  const planeBody = new Body({ mass: 0 });
  planeBody.addShape(planeShape);
  planeBody.material = new Material();

  const sph1_plane = new ContactMaterial(planeBody.material, sphere1Body.material, { friction: 0.0, restitution: 0.3 });
  const sph2_plane = new ContactMaterial(planeBody.material, sphere2Body.material, { friction: 0.0, restitution: 0.7 });
  const sph3_plane = new ContactMaterial(planeBody.material, sphere3Body.material, { friction: 0.0, restitution: 1.0 });

  world.addContactMaterial(sph1_plane);
  world.addContactMaterial(sph2_plane);
  world.addContactMaterial(sph3_plane);
  world.addBody(sphere1Body);
  world.addBody(sphere2Body);
  world.addBody(sphere3Body);
  world.addBody(planeBody);

  const clock = new Clock();
  function render() {
    world.step(1 / 120, clock.getDelta());

    mesh1.position.copy(sphere1Body.position);
    mesh2.position.copy(sphere2Body.position);
    mesh3.position.copy(sphere3Body.position);

    orbitControl.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  const gui = new GUI();

  const control = {
    reset() {
      mesh1.position.set(0, 0, 50);
      mesh2.position.set(10, 0, 50);
      mesh3.position.set(-10, 0, 50);

      sphere1Body.position.set(0, 0, 50);
      sphere2Body.position.set(10, 0, 50);
      sphere3Body.position.set(-10, 0, 50);
    },
  };

  gui.add(control, 'reset');
  const folder1 = gui.addFolder('Red Ball');
  folder1.add(world.contactmaterials[0], 'restitution', 0, 1, 0.01);
  folder1.add(world.contactmaterials[0], 'friction', 0, 1, 0.01);

  const folder2 = gui.addFolder('Green Ball');
  folder2.add(world.contactmaterials[1], 'restitution', 0, 1, 0.01);
  folder2.add(world.contactmaterials[1], 'friction', 0, 1, 0.01);

  const folder3 = gui.addFolder('Yellow Ball');
  folder3.add(world.contactmaterials[0], 'restitution', 0, 1, 0.01);
  folder3.add(world.contactmaterials[0], 'friction', 0, 1, 0.01);

  window.scene = scene;
  window.camera = camera;
  window.world = world;
}
