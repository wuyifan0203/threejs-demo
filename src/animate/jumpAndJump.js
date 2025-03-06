/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-05 16:08:09
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-05 18:02:17
 * @FilePath: \threejs-demo\src\animate\jumpAndJump.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector3,
    AnimationMixer,
    Quaternion,
    MeshPhysicalMaterial,
    Mesh,
    SphereGeometry,
    CylinderGeometry,
    VectorKeyframeTrack,
    AnimationClip,
    QuaternionKeyframeTrack
} from "three";
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initDirectionLight,
    initClock,
    initCustomGrid,
    initAmbientLight,
    PI,
    TWO_PI,
} from "../lib/tools/index.js";

window.onload = function () {
    init();

};

function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));

    const scene = initScene();

    initAmbientLight(scene);

    const light = initDirectionLight();
    light.position.set(70, 70, 70);
    scene.add(light);

    const grid = initCustomGrid(scene);
    grid.rotateX(PI / 2);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const model = createModel();
    scene.add(model);

    const mixer = new AnimationMixer(model);
    const jumpTrack = createJumpTrack();
    const rotateTrack = createRotateTrack();
    const jumpClip = new AnimationClip('jump', 1, [rotateTrack])
    const action = mixer.clipAction(jumpClip);

    let startTime = 0;
    let deltaTime = 0;
    let distance = 0;
    const speed = 2;
    let totalTime = 0;
    let leftTime = 0;
    window.addEventListener('mousedown', (e) => {
        startTime = Date.now();
        console.log(startTime);
    });

    window.addEventListener('mouseup', (e) => {
        deltaTime = Date.now() - startTime;
        console.log(deltaTime);
        isJumping = true;
        distance = deltaTime / 1000;
        totalTime = leftTime = distance / speed;
        console.log('totalTime: ', totalTime);
        action.timeScale = 1 / totalTime;
        console.log(action.timeScale);

        action.reset();
        action.play();
    });

    mixer.addEventListener('loop', () => {
        isJumping = false;
    });

    const clock = initClock();
    let delta = 0;
    let isJumping = false;
    const translate = new Vector3();
    function render() {
        delta = clock.getDelta();
        orbitControls.update();
        renderer.render(scene, camera);

        if (isJumping) {
            mixer.update(delta);
            leftTime -= delta;
            translate.x = delta * speed;
            model.position.y = Math.sin((leftTime / totalTime) * PI) * 5;
            model.position.add(translate);
        }
        requestAnimationFrame(render);
    }
    render();


}

function createModel() {
    const modeMaterial = new MeshPhysicalMaterial({ color: '#18325a', roughness: 0.2 });
    const head = new Mesh(new SphereGeometry(1.0, 32, 32), modeMaterial);
    head.name = "head";
    head.geometry.translate(0, 4.5, 0);
    const body = new Mesh(new CylinderGeometry(0.8, 1, 3, 16), modeMaterial);
    body.name = "body";
    body.geometry.translate(0, 1.5, 0);
    body.add(head);
    return body;
}

function createJumpTrack() {
    const time = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const position = [];
    time.forEach((t) => {
        position.push(0, Math.sin(t * PI) * 5, 0)
    })
    const track = new VectorKeyframeTrack('.position', time, position);

    return track;
}

function createRotateTrack() {
    const time = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const quaternion = [];
    const q = new Quaternion();
    const axis = new Vector3(0, 0, 1);
    time.forEach((t, i) => {
        q.setFromAxisAngle(axis, t * TWO_PI);
        q.toArray(quaternion, i * 4);
    })
    const track = new QuaternionKeyframeTrack('.quaternion', time, quaternion);

    return track;
}