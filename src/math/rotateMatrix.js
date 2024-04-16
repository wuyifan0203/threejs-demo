/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-03 17:14:03
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-04-16 17:51:38
 * @FilePath: /threejs-demo/src/math/rotateMatrix.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector3,
    OrthographicCamera,
    GridHelper,
    BoxGeometry,
    MeshLambertMaterial,
    AmbientLight,
    Matrix4,
    CylinderGeometry
} from '../lib/three/three.module.js';

import {
    initRenderer,
    initOrbitControls,
    initGUI,
    initDirectionLight,
    initScene,
    initOrthographicCamera
} from '../lib/tools/index.js';


window.onload = function () {
    init();
};

function init() {

    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, -100, 100))
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    camera.updateProjectionMatrix();

    const scene = initScene();
    const control = initOrbitControls(camera, renderer.domElement);

    function render() {
        renderer.render(scene, camera);
        control.update();
    }

    renderer.setAnimationLoop(render);


    const gui = initGUI();
    scene.add(new AmbientLight());
    const light = initDirectionLight();
    light.position.set(0, -10, 5);
    scene.add(light)


    const grid = new GridHelper(30, 30);
    grid.rotateX(Math.PI / 2);
    scene.add(grid)

    const material = new MeshLambertMaterial({ color: 0xf0ff00 })

    const bottom = new Mesh(new BoxGeometry(10, 10, 1), material);
    scene.add(bottom);

    const body = new Mesh(new BoxGeometry(3, 3, 10), material);
    body.position.set(0, 0, 5);
    bottom.add(body);

    const arm = new Mesh(new BoxGeometry(2, 3, 10), new MeshLambertMaterial({ color: '#ff0ff0' }));
    arm.position.set(0, 0, 10);
    body.add(arm);


    const _m = new Matrix4();
    window.addEventListener('keypress', (e) => {
        switch (e.key) {
            case 'd': // 右
                _m.makeTranslation(1, 0, 0);
                bottom.applyMatrix4(_m);
                break;
            case 'a': // 左
                _m.makeTranslation(-1, 0, 0);
                bottom.applyMatrix4(_m);
                break;
            case 'w': // 上
                _m.makeTranslation(0, 1, 0);
                bottom.applyMatrix4(_m);
                break;
            case 's': // 下
                _m.makeTranslation(0, -1, 0);
                bottom.applyMatrix4(_m);
                break;
            case 'q': // 左转
                _m.makeRotationAxis(new Vector3(0, 0, 1), 0.1);
                body.applyMatrix4(_m);
                break;
            case 'e': // 右转
                _m.makeRotationAxis(new Vector3(0, 0, 1), -0.1);
                body.applyMatrix4(_m);
                break;
            case 't':
                _m.makeRotationAxis(new Vector3(1, 0, 0), 0.1);
                arm.applyMatrix4(_m);
                break;
            case 'y':
                _m.makeRotationAxis(new Vector3(1, 0, 0), -0.1);
                arm.applyMatrix4(_m);
                break;
            default:
                break;
        }

    })

}