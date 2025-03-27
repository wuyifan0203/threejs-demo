/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-20 16:26:18
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-27 18:43:44
 * @FilePath: \threejs-demo\src\helper\viewIndicatorHelper.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Vector3 } from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initScene,
    resize,
    initGUI,
    initTrackballControls,
    initClock,
    createBackgroundTexture
} from '../lib/tools/index.js';
import { ViewIndicator } from '../lib/custom/ViewIndicator.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, -200, 200));
    camera.zoom = 2
    camera.updateProjectionMatrix();

    const scene = initScene();
    renderer.setClearColor(0xeeeeee);
    initCustomGrid(scene);

    let helper, viewIndicator;

    const params = {
        face: {
            fontsSize: 28,
            range: 2,
            size: 1.6,
            radius: 0.4,
            smoothness: 4,
        },
        conner: {
            radius: 0.22,
            offset: 0.8,
            segments: 12,
        },
        edge: {
            width: 1.1,
            height: 0.2,
            offset: 0.9,
            radius: 0.08,
            smoothness: 3,
        },
        axis: {
            fontsSize: 48,
            length: 2.4,
        },
        color: {
            background: '#fafafa',
            hover: '#e0e0e0',
            faceContent: '#707070',
            opacity: 1,
        },
    }
    scene.background = createBackgroundTexture('#c7eefd', '#ffffff');

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
        const halfSize = params.face.range / 2;
        helper.scale.set(halfSize, halfSize, halfSize);
    }

    const controls = initTrackballControls(camera, renderer.domElement);

    createHelper();

    const clock = initClock();
    let deltaTime = 0;
    function render() {
        deltaTime = clock.getDelta();
        renderer.clear();
        if (helper.animating) {
            helper.update(deltaTime);
        } else {
            controls.update();
        }
        renderer.render(scene, camera);
        helper.center.copy(controls.target);
        helper.render(renderer);
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
    const faceGUI = gui.addFolder("face");
    faceGUI.add(params.face, "range", 0.5, 3, 0.1).onChange(createHelper);
    faceGUI.add(params.face, "size", 0.1, 5, 0.001).onChange(createHelper);
    faceGUI.add(params.face, "radius", 0.1, 1, 0.01).onChange(createHelper);
    faceGUI.add(params.face, "smoothness", 1, 10, 1).onChange(createHelper);
    faceGUI.add(params.face, "fontsSize", 1, 100, 1).onChange(createHelper);

    const connerGUI = gui.addFolder("conner");
    connerGUI.add(params.conner, "radius", 0.1, 1, 0.01).onChange(createHelper);
    connerGUI.add(params.conner, "offset", 0.1, 2, 0.01).onChange(createHelper);
    connerGUI.add(params.conner, "segments", 1, 32, 1).onChange(createHelper);

    const edgeGUI = gui.addFolder("edge");
    edgeGUI.add(params.edge, "width", 0.1, 2, 0.01).onChange(createHelper);
    edgeGUI.add(params.edge, "height", 0.1, 2, 0.01).onChange(createHelper);
    edgeGUI.add(params.edge, "offset", 0.1, 2, 0.01).onChange(createHelper);
    edgeGUI.add(params.edge, "radius", 0.1, 1, 0.01).onChange(createHelper);
    edgeGUI.add(params.edge, "smoothness", 1, 10, 1).onChange(createHelper);

    const axisGUI = gui.addFolder("axis");
    axisGUI.add(params.axis, "length", 0.1, 5, 0.01).onChange(createHelper);
    axisGUI.add(params.axis, "fontsSize", 1, 100, 1).onChange(createHelper);

    const colorGUI = gui.addFolder("color");
    colorGUI.addColor(params.color, "background").onChange(createHelper);
    colorGUI.addColor(params.color, "hover").onChange(createHelper);
    colorGUI.addColor(params.color, "faceContent").onChange(createHelper);
    colorGUI.add(params.color, "opacity", 0, 1, 0.01).onChange(createHelper);

    gui.add(helper, "animateSpeed", 0.2, 8, 0.01).name("animateSpeed");
}