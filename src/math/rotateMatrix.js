/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-03 17:14:03
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 14:39:42
 * @FilePath: /threejs-demo/src/math/rotateMatrix.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector3,
    GridHelper,
    BoxGeometry,
    MeshLambertMaterial,
    AmbientLight,
    Matrix4,
} from 'three';

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
    camera.zoom = 0.5;

    camera.updateProjectionMatrix();

    const scene = initScene();
    const control = initOrbitControls(camera, renderer.domElement);

    function render() {
        renderer.render(scene, camera);
        control.update();
        requestAnimationFrame(render);
    }
    render();



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

    const hand = new Mesh(new BoxGeometry(2, 6, 2), new MeshLambertMaterial({ color: '#00ffff' }));
    hand.position.set(0, 0, 6);
    arm.add(hand);

    const fingerGeometry = new BoxGeometry(1, 1, 3);
    const fingerMaterial = new MeshLambertMaterial({ color: '#00ff00' });
    const fingerA = new Mesh(fingerGeometry, fingerMaterial);
    const fingerB = new Mesh(fingerGeometry, fingerMaterial);
    fingerA.position.set(0, 2, 2.5);
    fingerB.position.set(0, -2, 2.5);
    hand.add(fingerA);
    hand.add(fingerB);

    const _m = new Matrix4();
    const _r = new Matrix4();
    const _t = new Matrix4();

    window.addEventListener('keypress', keyPressCallBack)

    function keyPressCallBack(e) {
        switch (e.key) {
            case 'D': // 右
                _t.makeTranslation(1, 0, 0);
                bottom.applyMatrix4(_t);
                break;
            case 'A': // 左
                _t.makeTranslation(-1, 0, 0);
                bottom.applyMatrix4(_t);
                break;
            case 'W': // 上
                _t.makeTranslation(0, 1, 0);
                bottom.applyMatrix4(_t);
                break;
            case 'S': // 下
                _t.makeTranslation(0, -1, 0);
                bottom.applyMatrix4(_t);
                break;
            case 'Q': // 左转
                _r.makeRotationAxis(new Vector3(0, 0, 1), 0.1);
                body.applyMatrix4(_r);
                break;
            case 'E': // 右转
                _r.makeRotationAxis(new Vector3(0, 0, 1), -0.1);
                body.applyMatrix4(_r);
                break;
            case 'T':
                _m.makeTranslation(0, 0, -5);
                _m.premultiply(_r.makeRotationAxis(new Vector3(1, 0, 0), 0.1));
                _m.premultiply(_t.makeTranslation(0, 0, 5));
                arm.applyMatrix4(_m);
                break;
            case 'Y':
                _m.makeTranslation(0, 0, -5);
                _m.premultiply(_r.makeRotationAxis(new Vector3(1, 0, 0), -0.1));
                _m.premultiply(_t.makeTranslation(0, 0, 5));
                arm.applyMatrix4(_m);
                break;
            case 'G':
                _r.makeRotationAxis(new Vector3(0, 0, 1), 0.1);
                hand.applyMatrix4(_r);
                break;
            case 'H':
                _r.makeRotationAxis(new Vector3(0, 0, 1), -0.1);
                hand.applyMatrix4(_r);
                break;
            case 'J':
                _m.makeTranslation(0, -2, -1.0);
                _m.premultiply(_r.makeRotationAxis(new Vector3(1, 0, 0), 0.1));
                _m.premultiply(_t.makeTranslation(0, 2, 1.0));
                fingerA.applyMatrix4(_m);
                _m.makeTranslation(0, 2, -1.0);
                _m.premultiply(_r.makeRotationAxis(new Vector3(1, 0, 0), -0.1));
                _m.premultiply(_t.makeTranslation(0, -2, 1.0));
                fingerB.applyMatrix4(_m);
                break;
            case 'K':
                _m.makeTranslation(0, -2, -1.0);
                _m.premultiply(_r.makeRotationAxis(new Vector3(1, 0, 0), -0.1));
                _m.premultiply(_t.makeTranslation(0, 2, 1.0));
                fingerA.applyMatrix4(_m);
                _m.makeTranslation(0, 2, -1.0);
                _m.premultiply(_r.makeRotationAxis(new Vector3(1, 0, 0), 0.1));
                _m.premultiply(_t.makeTranslation(0, -2, 1.0));
                fingerB.applyMatrix4(_m);
                break;
            default:
                break;
        }
    }

    const operations = {
        pressW() {
            keyPressCallBack({ key: 'w' })
        },
        pressS() {
            keyPressCallBack({ key: 's' })
        },
        pressA() {
            keyPressCallBack({ key: 'a' })
        },
        pressD() {
            keyPressCallBack({ key: 'd' })
        },
        pressQ() {
            keyPressCallBack({ key: 'q' })
        },
        pressE() {
            keyPressCallBack({ key: 'e' })
        },
        pressT() {
            keyPressCallBack({ key: 't' })
        },
        pressY() {
            keyPressCallBack({ key: 'y' })
        },
        pressG() {
            keyPressCallBack({ key: 'g' })
        },
        pressH() {
            keyPressCallBack({ key: 'h' })
        },
        pressJ() {
            keyPressCallBack({ key: 'j' })
        },
        pressK() {
            keyPressCallBack({ key: 'k' })
        }
    }
    gui.add(operations, 'pressW').name('Move Up (press KeyW)');
    gui.add(operations, 'pressS').name('Move Down (press KeyS)');
    gui.add(operations, 'pressA').name('Move Left (press KeyA)');
    gui.add(operations, 'pressD').name('Move Right (press KeyD)');
    gui.add(operations, 'pressQ').name('Rotate Body Left (press KeyQ)');
    gui.add(operations, 'pressE').name('Rotate Body Right (press KeyE)');
    gui.add(operations, 'pressT').name('Rotate Arm Left (press KeyT)');
    gui.add(operations, 'pressY').name('Rotate Arm Right (press KeyY)');
    gui.add(operations, 'pressG').name('Rotate Hand Left (press KeyG)');
    gui.add(operations, 'pressH').name('Rotate Hand Right (press KeyH)');
    gui.add(operations, 'pressJ').name('Catch (press KeyJ)');
    gui.add(operations, 'pressK').name('Throw (press KeyK)');

}