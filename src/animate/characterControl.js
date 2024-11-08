/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-07 17:09:45
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-08 19:09:37
 * @FilePath: \threejs-demo\src\animate\characterControl.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */


import {
    Vector3,
    AnimationMixer,
    Object3D,
    Quaternion,
    Group,
    MeshPhysicalMaterial,
    Mesh,
    SphereGeometry,
    CylinderGeometry,
    VectorKeyframeTrack,
    AnimationClip,
    QuaternionKeyframeTrack
} from "../lib/three/three.module.js";
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    initScene,
    initDirectionLight,
    modelPath,
    initClock,
    initCustomGrid,
    resize,
    initAxesHelper,
    initPerspectiveCamera,
    initAmbientLight,
    PI,
    TWO_PI,
    initLoader,
    initGroundPlane,
    HALF_PI,
} from "../lib/tools/index.js";

const loader = initLoader();

window.onload = function () {
    init();
};

async function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));

    const scene = initScene();

    initAmbientLight(scene);

    const light = initDirectionLight();
    light.position.set(70, 70, 70);
    scene.add(light);

    const ground = initGroundPlane(scene);
    ground.rotateX(-HALF_PI);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const character = await createCharacter();

    scene.add(character.model);

    window.addEventListener('keydown', (event)=>{
        character.keyDown(event);
    });

    window.addEventListener('keyup', (event)=>{
        character.keyUp(event);
    });


    const clock = initClock();
    let delta = 0;
    function render() {
        delta = clock.getDelta();
        orbitControls.update();
        renderer.render(scene, camera);
        character.update(delta);
        requestAnimationFrame(render);
    }
    render();
}

async function createCharacter() {
    const model = (await loader.loadAsync(`../../${modelPath}/character/character.glb`)).scene;
    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    })
    const idleClip = (await loader.loadAsync(`../../${modelPath}/character/character-idle.fbx`)).animations[0];
    const walkClip = (await loader.loadAsync(`../../${modelPath}/character/character-walk.fbx`)).animations[0];
    const jumpClip = (await loader.loadAsync(`../../${modelPath}/character/character-jump.fbx`)).animations[0];

    const mixer = new AnimationMixer(model);

    const actionMap = {
        idle: mixer.clipAction(idleClip),
        walk: mixer.clipAction(walkClip),
        jump: mixer.clipAction(jumpClip)
    }
    let currentAction = actionMap.idle;
    currentAction.play();
    let nextAction = null;

    const direction = new Vector3();

    const keyPressed = {
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
        shift: false
    };

    function keyDown(event) {
        const key = event.key.toLowerCase();
        keyPressed[key] = true;
    }

    function keyUp(event) {
        const key = event.key.toLowerCase();
        keyPressed[key] = false;
    }

    function update(dt) {
        updateAction(dt);
        updateDirection();
    }

    function updateAction(dt) {
        mixer.update(dt);
        if (keyPressed.w || keyPressed.a || keyPressed.s || keyPressed.d) {
            nextAction = actionMap.walk;
        } else { 
            nextAction = actionMap.idle;
        }

        if (currentAction !== nextAction) {
            currentAction.fadeOut(0.5);
            nextAction.reset().fadeIn(0.5).play();
            currentAction = nextAction;
        }
    }

    function updateDirection() {
        direction.set(0, 0, 0);
      
        if (keyPressed.w) direction.x += 1;
        if (keyPressed.s) direction.x -= 1;
        if (keyPressed.a) direction.z -= 1;
        if (keyPressed.d) direction.z += 1;
      
        direction.normalize();
      }
      

    return {
        model,
        keyDown,
        keyUp,
        update
    }
}

