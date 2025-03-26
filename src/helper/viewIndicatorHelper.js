/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-20 16:26:18
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-26 18:09:22
 * @FilePath: \threejs-demo\src\helper\viewIndicatorHelper.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Matrix4, Vector2, Vector3, } from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initScene,
    resize,
    initGUI,
    initTrackballControls,
    initClock,
    initCoordinates
} from '../lib/tools/index.js';
import { ViewIndicator, rotationMap } from '../lib/custom/ViewIndicator.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, -200, 200));
    // camera.up.set(0, 0, 1);
    camera.zoom = 2
    camera.updateProjectionMatrix();

    const scene = initScene();
    renderer.setClearColor(0xeeeeee);
    initCustomGrid(scene);

    const coord = initCoordinates(5);

    // scene.add(coord);


    const coord2 = initCoordinates(8);
    coord2.setColors({
        x: '#ff4466',
        y: '#88ff44',
        z: '#4488ff',
    });
    // scene.add(coord2);

    const { target, up } = rotationMap[4]
    coord2.quaternion.setFromRotationMatrix(new Matrix4().lookAt(new Vector3(), target, up));

    let helper, viewIndicator;

    const params = {
        "faceText": [
            "LEFT",
            "RIGHT",
            "BACK",
            "FRONT",
            "TOP",
            "BOTTOM",
        ],
        "faceTextColor": "#6e6e6e",
        "faceTextSize": 28,
        "axisColor": [
            '#ff4466',
            '#88ff44',
            '#4488ff',
        ],
        "axisTextSize": 48,
        "size": 2,
        "faceSize": 1.6,
        "faceRadius": 0.4,
        "faceSmoothness": 4,
        "connerRadius": 0.22,
        "connerOffset": 0.79,
        "connerSegments": 16,
        "edgeWidth": 1.1,
        "edgeHeight": 0.2,
        "edgeOffset": 0.9,
        "backgroundColor": "#ffffff",
        "hoverColor": "#0ae2ff",
        "renderOffset": new Vector2(1, 1)
    }

    function createHelper() {
        if (viewIndicator) {
            scene.remove(viewIndicator);
            viewIndicator.dispose();
        }
        if (helper) {
            helper.dispose();
        }
        viewIndicator = new ViewIndicator(camera, renderer.domElement, params);
        scene.add(viewIndicator);

        helper = new ViewIndicator(camera, renderer.domElement, params);
        helper.scale.set(params.size / 2, params.size / 2, params.size / 2);
    }

    const controls = initTrackballControls(camera, renderer.domElement);
    console.log('controls: ', controls);

    createHelper();

    const clock = initClock();
    let deltaTime = 0;
    function render() {
        renderer.clear();
        controls.update();
        deltaTime = clock.getDelta();
        // coord.quaternion.copy(camera.quaternion);
        renderer.render(scene, camera);
        helper.center.copy(controls.target);
        if (helper.animating) {
            helper.update(deltaTime);
        }
        helper?.render(renderer);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);

    renderer.domElement.addEventListener('click', (e) => {
        helper.handleClick(e);
    })

    renderer.domElement.addEventListener('mousemove', (e) => {
        helper.handleMove(e);
    })

    const gui = initGUI();

    gui.add(params, "size", 0.5, 3, 0.1).onChange(createHelper);
    gui.add(params, "faceSize", 0.1, 5, 0.001).onChange(createHelper);
    gui.add(params, "faceRadius", 0.1, 1, 0.001).onChange(createHelper);
    gui.add(params, "faceTextSize", 1, 100, 1).onChange(createHelper);
    gui.add(params, "axisTextSize", 1, 100, 1).onChange(createHelper);
    gui.add(params, "connerRadius", 0.1, 2, 0.001).onChange(createHelper);
    gui.add(params, "connerOffset", 0.1, 2, 0.001).onChange(createHelper);
    gui.add(params, "connerSegments", 1, 32, 1).onChange(createHelper);
    gui.add(params, "edgeWidth", 0.1, 2, 0.01).onChange(createHelper);
    gui.add(params, "edgeHeight", 0.1, 2, 0.01).onChange(createHelper);
    gui.add(params, "edgeOffset", 0.1, 2, 0.001).onChange(createHelper);
    gui.addColor(params, "backgroundColor").onChange(createHelper);
    gui.addColor(params, "hoverColor").onChange(createHelper);
    gui.addColor(params, "faceTextColor").onChange(createHelper);
    gui.add(params.renderOffset, "x", 0, 1, 0.01).onChange(createHelper).name("renderOffsetX");
    gui.add(params.renderOffset, "y", 0, 1, 0.01).onChange(createHelper).name("renderOffsetY");
}