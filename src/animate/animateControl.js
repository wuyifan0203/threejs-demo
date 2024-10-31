/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-31 11:16:20
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-31 18:12:11
 * @FilePath: \threejs-demo\src\animate\animateControl.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
  Vector3,
  AnimationMixer,
} from "../lib/three/three.module.js";
import {
  initRenderer,
  initOrthographicCamera,
  initOrbitControls,
  initGUI,
  initScene,
  initDirectionLight,
  HALF_PI,
  modelPath,
  initClock,
  initCustomGrid,
  resize,
} from "../lib/tools/index.js";
import { FBXLoader } from "../lib/three/FBXLoader.js";

window.onload = () => {
  init();
};

async function init() {
  const renderer = initRenderer({});

  const camera = initOrthographicCamera(new Vector3(100, -100, 100));
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1);
  camera.zoom = 0.5;
  camera.updateProjectionMatrix();

  const scene = initScene();
  initCustomGrid(scene);
  const orbitControl = initOrbitControls(camera, renderer.domElement);

  const light = initDirectionLight();
  light.position.set(45, -50, 0);
  scene.add(light);

  const loader = new FBXLoader();

  const walkGroup = await loader.loadAsync(`../../${modelPath}/ZombieWalk.fbx`);
  walkGroup.scale.set(0.05, 0.05, 0.05);
  walkGroup.rotateX(HALF_PI);
  scene.add(walkGroup);

  const idleGroup = await loader.loadAsync(`../../${modelPath}/ZombieIdle.fbx`);
  // 删除位移，保证动画在原点
  walkGroup.animations[0].tracks.shift();

  const clips = [walkGroup.animations[0], idleGroup.animations[0], walkGroup.animations[1]];

  const mixer = new AnimationMixer(walkGroup);
  const [walkAction, idleAction, defaultAction] = clips.map((clip) =>
    mixer.clipAction(clip)
  );

  const actionMap = {
    walkAction,
    idleAction,
    defaultAction,
  };
  const speed = [0, 0.5, 1, 1.5, 2, 3, 5];
  const gui = initGUI();
  const params = {
    currentAction: 'walkAction',
    walkToIdle() {
      executeCrossFade(walkAction, idleAction, 0.5);
    },
    idleToWalk() {
      executeCrossFade(idleAction, walkAction, 0.5);
    },
    reset(){
      const action = actionMap[params.currentAction];
      action.reset().play();
    },
    currentActionTimeScale: 1,
    effectDuration: 1,
  };
  const commonFolder = gui.addFolder("Common");
  const actionsKeys = Object.keys(actionMap);
  commonFolder.add(params, "currentAction", actionsKeys).onFinishChange(changeAction);
  const effect = commonFolder.add(params, "effectDuration").disable().name("Effect duration");
  const actionTimeScale = commonFolder.add(params, "currentActionTimeScale", speed).name("Action timeScale").onChange(computedDuration);
  commonFolder.add(mixer, "timeScale", speed).name("Mixer timeScale").onChange(computedDuration);
  commonFolder.add(params,'reset')


  function changeAction() {
    actionsKeys.forEach((key) => {
      actionMap[key].stop();
    });
    actionMap[params.currentAction].play();
  }
  function computedDuration() {
    const action = actionMap[params.currentAction];
    action.timeScale = params.currentActionTimeScale;
    params.effectDuration = action.getClip().duration / (action.timeScale * mixer.timeScale);
    effect.setValue(params.effectDuration.toFixed(3));
  }

  const clock = initClock();
  function render() {
    orbitControl.update();
    renderer.render(scene, camera);
    mixer.update(clock.getDelta());
  }

  renderer.setAnimationLoop(render);

  resize(renderer, camera);
}

function executeCrossFade(startAction, endAction, duration) {
  if (endAction) {
    // 确保目标动画权重为 1
    endAction.setEffectWeight(1);
    endAction.setEffectiveTimeScale(1);
    endAction.enable = true;
    endAction.time = 0; // 将目标动画时间重置为 0，确保动画从头播放

    if (startAction) {
      // 如果有开始的动画，进行交叉渐变
      // crossFadeTo 方法用于将 startAction 动画逐渐转换到 endAction 动画
      startAction.crossFadeTo(endAction, duration, true);
    } else {
      // 如果没有开始的动画，直接淡入目标动画
      endAction.fadeIn(duration);
    }
  } else {
    // 如果没有目标动画，只需淡出当前动画
    startAction.fadeOut(duration);
  }
}