/*
 * @Date: 2023-09-01 13:44:22
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-30 11:28:31
 * @FilePath: \threejs-demo\src\animate\keyframeTrack.js
 */
import {
  BoxGeometry,
  Vector3,
  MeshPhongMaterial,
  Mesh,
  NumberKeyframeTrack,
  VectorKeyframeTrack,
  AnimationClip,
  AnimationMixer,
  Clock,
  Group,
  LineLoop,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  ColorKeyframeTrack,
  MeshNormalMaterial,
  BooleanKeyframeTrack,
  Quaternion,
  QuaternionKeyframeTrack,
  CameraHelper,
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initOrthographicCamera,
  initGroundPlane,
  initOrbitControls,
  initGUI,
  initScene,
  initDirectionLight,
  resize,
  HALF_PI,
  PI,
  TWO_PI,
} from "../lib/tools/index.js";

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer({});

  const camera = initOrthographicCamera(new Vector3(18, 1440, 960));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.5;
  camera.updateProjectionMatrix();

  const scene = initScene();

  const light = initDirectionLight();

  light.shadow.camera.far = 110;
  light.shadow.camera.near = 60;
  light.shadow.camera.left = -70;
  light.shadow.camera.right = 30;
  light.shadow.camera.top = 30;
  light.shadow.camera.bottom = -30;
  light.position.set(40, 40, 70);
  scene.add(light);

  const orbitControl = initOrbitControls(camera, renderer.domElement);
  orbitControl.target.set(-1, 3, -1.5);
  orbitControl.update();

  initGroundPlane(scene);

  const geometry = new BoxGeometry(3, 3, 3);
  geometry.translate(0, 0, 1.5);

  const mixers = [];
  const actions = [];
  const kfs = [];

  const position = [-5, -5, 0, 5, -5, 0, 5, 5, 0, -5, 5, 0, -5, -5, 0];
  const posTime = [0, 2, 4, 6, 8];

  const colors = [
    1.0,
    0.0,
    0.0, // 红色
    1.0,
    0.647,
    0.0, // 橙色
    1.0,
    1.0,
    0.0, // 黄色
    0.0,
    0.502,
    0.0, // 绿色
    0.0,
    1.0,
    1.0, // 青色
    0.0,
    0.0,
    0.0, // 黑色
    1.0,
    0.502,
    0.0, // 棕色
    0.502,
    0.0,
    0.502, // 紫色
  ];
  const colorTime = [0, 1, 2, 3, 4, 5, 6, 7];

  const opacity = [1, 0.5, 0.3, 0, 0.3, 0.5, 1];
  const opacityTime = [0, 1, 2, 3, 4, 5, 6];

  const wireframe = [false, true];
  const wireframeTime = [0, 1];

  const quaternion = [];
  const q = new Quaternion();
  const axis = new Vector3(0, 0, 1);
  [0, HALF_PI, PI, TWO_PI].forEach((angle, i) => {
    q.setFromAxisAngle(axis, angle).toArray(quaternion, i * 4);
  });
  const quaternionTime = [0, 0.5, 1, 1.5];
  function createVectorKF() {
    const mesh = new Mesh(geometry, new MeshPhongMaterial({ color: "orange" }));
    mesh.castShadow = true;

    //1. create a track for the position
    const track = new VectorKeyframeTrack(".position", posTime, position);

    // 2. create a clip with the track
    const clip = new AnimationClip("translate", 8, [track]);

    // 3. create a mixer
    const mixer = new AnimationMixer(mesh);

    // 4. create an action
    const action = mixer.clipAction(clip);

    actions.push(action);
    mixers.push(mixer);
    kfs.push(track);
    const group = new Group();
    group.add(mesh);
    scene.add(group);

    const loop = new BufferGeometry().setAttribute(
      "position",
      new Float32BufferAttribute(position, 3)
    );
    const line = new LineLoop(loop, new LineBasicMaterial({ color: 0xff0000 }));
    group.add(line);
  }

  function createColorKF() {
    const mesh = new Mesh(geometry, new MeshPhongMaterial({ color: "red" }));
    mesh.castShadow = true;

    const track = new ColorKeyframeTrack(".material.color", colorTime, colors);

    const clip = new AnimationClip("color", 6, [track]);

    const mixer = new AnimationMixer(mesh);

    const action = mixer.clipAction(clip);

    actions.push(action);
    mixers.push(mixer);
    kfs.push(track);

    const group = new Group();
    group.position.set(-20, 0, 0);
    group.add(mesh);
    scene.add(group);
  }

  function createNumberKF() {
    const mesh = new Mesh(
      geometry,
      new MeshPhongMaterial({ color: "skyblue", transparent: true })
    );
    mesh.castShadow = true;

    const track = new NumberKeyframeTrack(
      ".material.opacity",
      opacityTime,
      opacity
    );

    const clip = new AnimationClip("opacity", 7, [track]);

    const mixer = new AnimationMixer(mesh);

    const action = mixer.clipAction(clip);

    actions.push(action);
    mixers.push(mixer);
    kfs.push(track);

    const group = new Group();
    group.position.set(20, 0, 0);
    group.add(mesh);
    scene.add(group);
  }

  function createBooleanKF() {
    const mesh = new Mesh(
      new BoxGeometry(3, 3, 3, 10, 10, 10).translate(0, 0, 1.5),
      new MeshNormalMaterial()
    );
    mesh.castShadow = true;

    const track = new BooleanKeyframeTrack(
      ".material.wireframe",
      wireframeTime,
      wireframe
    );

    const clip = new AnimationClip("wireframe", 2, [track]);

    const mixer = new AnimationMixer(mesh);

    const action = mixer.clipAction(clip);

    actions.push(action);
    mixers.push(mixer);
    kfs.push(track);

    const group = new Group();
    group.add(mesh);
    group.position.set(0, 20, 0);
    scene.add(group);
  }

  function createQuaternionKF() {
    const mesh = new Mesh(geometry, new MeshPhongMaterial({ color: "yellow" }));
    mesh.castShadow = true;

    const track = new QuaternionKeyframeTrack(
      ".quaternion",
      quaternionTime,
      quaternion
    );

    const clip = new AnimationClip("quaternion", 1.5, [track]);

    const mixer = new AnimationMixer(mesh);

    const action = mixer.clipAction(clip);

    mixers.push(mixer);
    actions.push(action);
    kfs.push(track);

    const group = new Group();
    group.add(mesh);
    group.position.set(20, 20, 0);
    scene.add(group);
  }

  function createComprehensiveKF() {
    const mesh = new Mesh(
      new BoxGeometry(3, 3, 3, 10, 10, 10).translate(0, 0, 1.5),
      new MeshPhongMaterial({ color: 0x00ff00, transparent: true })
    );
    mesh.castShadow = true;

    const totalTime = 8;

    const mixer = new AnimationMixer(mesh);

    const clip = new AnimationClip("comprehensive", totalTime, kfs);

    const action = mixer.clipAction(clip);

    mixers.push(mixer);
    actions.push(action);

    const group = new Group();
    group.position.set(-20, 20, 0);
    group.add(mesh);
    scene.add(group);
  }

  createVectorKF();
  createColorKF();
  createNumberKF();
  createBooleanKF();
  createQuaternionKF();
  createComprehensiveKF();

  const clock = new Clock();
  let delta = 0;
  (function render() {
    delta = clock.getDelta();
    orbitControl.update();
    mixers.forEach((mixer) => mixer.update(delta));
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  })();

  const gui = initGUI();

  const o = {
    play() {
      actions.forEach((action) => action.play());
    },
    paused() {
      actions.forEach((action) => {
        action.paused = !action.paused;
      });
    },
    stop() {
      actions.forEach((action) => action.stop());
    },
    reset() {
      actions.forEach((action) => action.reset());
    },
  };

  gui.add(o, "play");
  gui.add(o, "paused").name("paused/continue");
  gui.add(o, "stop");
  gui.add(o, "reset");

  resize(renderer, camera);
}
