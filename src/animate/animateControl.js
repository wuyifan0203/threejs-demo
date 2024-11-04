/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-31 11:16:20
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-04 17:28:25
 * @FilePath: \threejs-demo\src\animate\animateControl.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  Vector3,
  AnimationMixer,
  Object3D,
  Quaternion,
  Matrix4
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initOrthographicCamera,
  initOrbitControls,
  initGUI,
  initScene,
  initDirectionLight,
  HALF_PI,
  PI,
  modelPath,
  initClock,
  initCustomGrid,
  resize,
  initAxesHelper,
  initCoordinates,
} from "../lib/tools/index.js";
import { FBXLoader } from "../lib/three/FBXLoader.js";

window.onload = () => {
  init();
};

let isWalking = false;
let speed = 0;

const baseSpeed = 2;
const zero = new Vector3(0, 0, 0);
const axis = new Vector3(0, 0, 1);
const translate = new Vector3();
const direction = new Vector3();
const targetQuaternion = new Quaternion();
const rotateMatrix = new Matrix4();
const keyPressed = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
  space: false,
};

async function init() {
  const renderer = initRenderer({});

  const defaultPosition = new Vector3(100, -100, 100)

  const camera = initOrthographicCamera(defaultPosition);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.5;
  camera.updateProjectionMatrix();

  const scene = initScene();
  initCustomGrid(scene);
  initAxesHelper(scene);
  const orbitControl = initOrbitControls(camera, renderer.domElement);

  const light = initDirectionLight();
  light.position.set(45, -50, 0);
  scene.add(light);

  const loader = new FBXLoader();

  const walkGroup = await loader.loadAsync(`../../${modelPath}/ZombieWalk.fbx`);
  walkGroup.scale.set(0.05, 0.05, 0.05);
  const model = new Object3D();
  model.up.set(0, 0, 1);
  model.lookAt(1, 0, 0);
  model.add(walkGroup);
  scene.add(model);

  const idleGroup = await loader.loadAsync(`../../${modelPath}/ZombieIdle.fbx`);
  // 删除位移，保证动画在原点
  walkGroup.animations[0].tracks.shift();

  const clips = {
    walk: walkGroup.animations[0],
    idle: idleGroup.animations[0],
    default: walkGroup.animations[1]
  };

  const mixer = new AnimationMixer(walkGroup);
  const [walkAction, idleAction, defaultAction] = Object.keys(clips).map((key) => {
    const action = mixer.clipAction(clips[key]);
    action.name = key;
    return action;
  });

  const actionMap = {
    walkAction,
    idleAction,
    defaultAction,
  };
  const playSpeed = [0, 0.5, 1, 1.5, 2, 3, 5];
  const gui = initGUI();
  const params = {
    mode: 'control',
    currentAction: 'defaultAction',
    reset,
    currentActionTimeScale: 1,
    effectDuration: 1,
  };
  gui.add(params, "mode", ["common", "control"]).onChange(changeMode);
  const commonFolder = gui.addFolder("Common");
  const actionsKeys = Object.keys(actionMap);
  commonFolder.add(params, "currentAction", actionsKeys).onFinishChange(changeAction);
  const effect = commonFolder.add(params, "effectDuration").disable().name("Effect duration");
  const actionTimeScale = commonFolder.add(params, "currentActionTimeScale", playSpeed).name("Action timeScale").onChange(computedDuration);
  const mixerTimeScale = commonFolder.add(mixer, "timeScale", playSpeed).name("Mixer timeScale").onChange(computedDuration);
  commonFolder.add(params, 'reset');


  // gui controls
  function changeAction() {
    actionsKeys.forEach((key) => {
      actionMap[key].stop();
    });
    actionMap[params.currentAction].play();
    computedDuration();
  }
  function computedDuration() {
    Object.values(actionMap).forEach((action) => {
      action.timeScale = params.currentActionTimeScale
    });
    const action = actionMap[params.currentAction];
    params.effectDuration = action.getClip().duration / (action.timeScale * mixer.timeScale);
    effect.setValue(params.effectDuration.toFixed(3));
  }
  function reset() {
    Object.values(actionMap).forEach((action) => {
      action.timeScale = 1;
      action.reset();
      action.play();
    });

    params.currentActionTimeScale = mixer.timeScale = 1;
    actionTimeScale.setValue(params.currentActionTimeScale);
    mixerTimeScale.setValue(params.currentActionTimeScale);
  }

  function changeMode() {
    if (params.mode === 'common') {
      commonFolder.show();
      // orbitControl.enabled = true;
    } else {
      commonFolder.hide();
      model.position.set(0, 0, 0);
      orbitControl.target.set(0, 0, 0);
      camera.position.copy(defaultPosition);
      orbitControl.update();
      // orbitControl.enabled = false;
      idleAction.fadeIn(0.5);
    }
  }


  // keyboard control

  const walkKey = ['w', 'a', 's', 'd'];
  
  window.addEventListener('keydown', (e) => {
    if (params.mode === 'common') return;
    const key = e.key.toLowerCase();
    keyPressed[key] = true;

    if (walkKey.includes(key)) {
      startWalking();
    }
    updateSpeed();
  });

  function startWalking() {
    if (!isWalking) {
      isWalking = true
    }
    updateDirection();
  }

  window.addEventListener('keyup', (e) => {
    if (params.mode === 'common') return;
    const key = e.key.toLowerCase();
    keyPressed[key] = false;
    if (walkKey.includes(key)) {
      stopWalking();
    }
    updateSpeed();
  });

  function stopWalking() {
    if (!keyPressed['w'] && !keyPressed['s'] && !keyPressed['a'] && !keyPressed['d']) {
      if (isWalking) {
        isWalking = false;
      }
      direction.set(0, 0, 0); // 停止移动
    }else{
      // 当还有按键按下时，说明方向发生变化需要更新方向
      updateDirection();
    }
  }

  const clock = initClock();
  let delta = 0;

  function render() {
    delta = clock.getDelta();
    orbitControl.update();
    renderer.render(scene, camera);
    mixer.update(delta);

    if (isWalking && direction.lengthSq() > 0) {
      translate.copy(direction).multiplyScalar(speed * delta);
      rotateMatrix.lookAt(translate, zero, model.up);
      targetQuaternion.setFromRotationMatrix(rotateMatrix);
      model.quaternion.slerp(targetQuaternion, 0.5);
      model.position.add(translate);
    }
  }

  renderer.setAnimationLoop(render);
  changeMode();
  reset();
  changeAction();
  resize(renderer, camera);
}

function updateDirection() {
  direction.set(0, 0, 0);

  if (keyPressed.w) direction.y += 1;
  if (keyPressed.s) direction.y -= 1;
  if (keyPressed.a) direction.x -= 1;
  if (keyPressed.d) direction.x += 1;

  direction.normalize();
}

function updateSpeed() {
  speed = keyPressed.shift ? baseSpeed * 3 : baseSpeed;
}
