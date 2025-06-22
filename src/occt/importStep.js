/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-06-10 23:36:34
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-06-23 01:13:58
 * @FilePath: /threejs-demo/src/occt/importStep.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    MeshNormalMaterial,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    const mesh = new Mesh(new BoxGeometry(3, 3, 3), new MeshNormalMaterial());
    scene.add(mesh);

    const worker = new Worker('./importStep.worker.js');

    const messageHandler = {
        init: () => {
            worker.postMessage({ type: 'init' });
        },
    };

    worker.onmessage = ({ data }) => {
        const { type, payload } = data;
        if (messageHandler[type]) {
            const response = messageHandler[type](payload);
            if (response) {
                worker.postMessage({ type, payload: response });
            }
        }
    };

    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
}