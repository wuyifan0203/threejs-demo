/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-05-31 16:08:18
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-29 16:43:18
 * @FilePath: \threejs-demo\src\animate\loadBot.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector2,
    Vector3,
    SkeletonHelper,
    AnimationMixer,
    Clock
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initGroundPlane,
    initOrbitControls,
    initScene,
    initGUI,
    initAmbientLight,
    initStats,
    initDirectionLight,
    initCustomGrid,
    resize
} from '../lib/tools/index.js';
import { GLTFLoader } from '../lib/three/GLTFLoader.js';
import { AnimationUtils } from '../lib/three/AnimationUtils.js';

window.onload = () => {
    init();
};

const baseActions = {
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 }
};

const additiveActions = {
    sneak_pose: { weight: 0 },
    sad_pose: { weight: 0 },
    agree: { weight: 0 },
    headShake: { weight: 0 }
};

const panelSetting = {
    timeScale: 1,
    currentBaseAction: 'idle',
}

const crossFadeControls = [];

async function init() {
    const renderer = initRenderer({});
    const camera = initOrthographicCamera(new Vector3(50, 50, 50));
    camera.zoom = 6;
    camera.updateProjectionMatrix();
    const scene = initScene();

    initStats()
    initAmbientLight(scene);
    const orbitControl = initOrbitControls(camera, renderer.domElement);
    orbitControl.target.set(0, 0.5, 0);
    orbitControl.update();

    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    scene.add(light);

    const grid = initCustomGrid(scene);
    grid.rotateX(-Math.PI / 2);
    const ground = initGroundPlane(grid, new Vector2(50, 50));
    ground.position.z -= 0.01;

    const botInfo = await loadBot(scene);

    initGUIPanel(botInfo)

    const clock = new Clock()

    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
        botInfo.mixer.update(clock.getDelta())
    }
    renderer.setAnimationLoop(render);

    resize(renderer, camera)
}

async function loadBot(scene) {
    const loader = new GLTFLoader();

    // animations为AnimationClip实例，一个实例代表一种动画
    const { scene: mesh, animations } = await loader.loadAsync('../../public/models/XBot.glb');

    console.log(animations);

    scene.add(mesh);

    console.log(mesh);
    

    // 创建骨骼辅助器
    const helper = new SkeletonHelper(mesh);
    helper.visible = false;
    scene.add(helper);

    const allActions = [];
    const actionsMap = {};
    // 1.动画混合器
    const mixer = new AnimationMixer(mesh);
    
    animations.forEach(clip => {
        const name = clip.name;
        if (baseActions[name]) {
            // 2.调用clipAction返回一个AnimationAction实例
            const action = mixer.clipAction(clip);
            baseActions[name]['action'] = action;
            activeAction(action);
            allActions.push(action);
        } else if (additiveActions[name]) {
            AnimationUtils.makeClipAdditive(clip);
            if (clip.name.endsWith('_pose')) {
                // 创建一个新的动画片段AnimationClip
                clip = AnimationUtils.subclip(clip, clip.name, 2, 3, 30)
            }
            const action = mixer.clipAction(clip);
            additiveActions[name]['action'] = action;
            activeAction(action);
            allActions.push(action);
        }

    });

    return {
        helper,
        mesh,
        actionsMap,
        allActions,
        mixer
    }
}

function initGUIPanel({ helper, mixer }) {
    const gui = initGUI({ width: 310 });
    const meshFolder = gui.addFolder('Mesh');
    meshFolder.add(helper, 'visible').name('skeletonHelper visible');

    const baseActionsFolder = gui.addFolder('Base Action');
    const additiveActionsFolder = gui.addFolder('Additive Actions Weights');
    const speedFolder = gui.addFolder('General Speed');

    const baseNames = ['None', ...Object.keys(baseActions)];

    baseNames.forEach((name) => {
        const actionSetting = baseActions[name];

        panelSetting[name] = function () {
            const currentSettings = baseActions[panelSetting.currentBaseAction];
            const currentAction = currentSettings?.action ?? null;
            const action = actionSetting?.action ?? null;

            if (currentAction !== action) {
                prepareCrossFade(currentAction, action, 0.35);
            }
        }

        crossFadeControls.push(baseActionsFolder.add(panelSetting, name))
    })

    for (const name of Object.keys(additiveActions)) {
        const settings = additiveActions[name];
        panelSetting[name] = settings.weight;
        additiveActionsFolder.add(panelSetting, name, 0, 1, 0.01).listen().onChange((weight) => {
            setWeight(settings.action, weight);
            settings.weight = weight;
        })
    }

    speedFolder.add(panelSetting, 'timeScale', 0.0, 1.5, 0.1).name('modify time scale').onChange(() => {
        mixer.timeScale = speed;
    });

    crossFadeControls.forEach((control) => {
        control.setInactive = () => {
            control.domElement.classList.add('control-inactive');
        }

        control.setActive = () => {
            control.domElement.classList.remove('control-inactive');
        }

        const settings = baseActions[control.property];
        if (!settings || settings.weight === 0) {
            control.setInactive();
        }
    })
}

function activeAction(action) {
    const clip = action.getClip();
    const settings = baseActions[clip.name] || additiveActions[clip.name];
    setWeight(action, settings.weight)
    action.play();
}

function setWeight(action, weight) {
    action.enable = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
}

function prepareCrossFade(currentAction, action, wight) {


}
