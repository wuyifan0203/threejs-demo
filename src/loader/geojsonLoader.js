/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-11 17:57:12
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-11 19:56:53
 * @FilePath: \threejs-demo\src\loader\geojsonLoader.js
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
    resize
} from '../lib/tools/index.js';
import { getGeoInfo } from '../lib/tools/geoConvert.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);

    scene.add(new Mesh(new BoxGeometry(3, 3, 3), new MeshNormalMaterial()))

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);

    const json = await loadJSONFile('../../public/data/map.json');

    const res = getGeoInfo(json)
    console.log('res: ', res);

    console.log(json);

}

async function loadJSONFile(filePath) {
    try {
        const response = await fetch(filePath);

        // 检查HTTP响应状态
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        // 解析JSON数据
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('加载JSON失败:', error);
        throw error; // 可选：将错误传递给调用方
    }
}