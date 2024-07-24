/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-24 15:07:54
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-07-24 17:57:05
 * @FilePath: /threejs-demo/src/plot/triangularMesh.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

import {
    BufferAttribute,
    BufferGeometry,
    CanvasTexture,
    Mesh,
    MeshBasicMaterial,
    Sprite,
    SpriteMaterial,
    Vector3,
    OrthographicCamera
} from '../lib/three/three.module.js';
import { jet } from '../lib/tools/colorMap.js';
import {
    initGUI,
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
    initScene
} from '../lib/tools/common.js';
import { PHI, E, JN, JP, TEST, TESTN, N, P } from './data/index.js';
import { Lut } from '../lib/three/Lut.js';

window.onload = () => {
    init()
}

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const scene = initScene();
    const uiScene = initScene();
    const camera = initOrthographicCamera(new Vector3(0, 0, 50));
    const uiCamera = new OrthographicCamera(- 1, 1, 1, - 1, 1, 2);
    uiCamera.position.set(-0.8, 0, 1);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const controls = initOrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;

    function render() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
        renderer.render(uiScene, uiCamera);
        requestAnimationFrame(render);
    }
    render();

    const data = { PHI, E, JN, JP, TEST, TESTN, N, P };

    let geometry = new BufferGeometry();
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ vertexColors: true, side: 1 }));
    const line = new Mesh(geometry, new MeshBasicMaterial({ color: 0xffffff, side: 1, wireframe: true, depthTest: false }));

    const lut = new Lut()
    const colorBar = new Sprite(new SpriteMaterial({ map: new CanvasTexture(lut.createCanvas())}));
    colorBar.scale.x = 0.05;

    scene.add(mesh);
    scene.add(line);
    uiScene.add(colorBar);

    const option = {
        key: 'PHI',
        lineColor: '#ffffff',
        scaleZ: 0
    }

    function renderPlot(key) {
        geometry.dispose();
        camera.zoom = 1;
        const { elements, vertices } = data[key];
        const sz = option.scaleZ

        const [minV, maxV] = minMax(vertices.map((e) => e[2]));
        const sV = maxV - minV;

        const position = new Float32Array(vertices.length * 3);
        const color = new Float32Array(vertices.length * 3);
        const origin = new Float32Array(vertices.length * 3);

        vertices.forEach((v, i) => {
            const z = (v[2] - minV) / sV;
            position.set([v[0] * 10e6, v[1] * 10e6, z * sz], i * 3);
            color.set(jet((v[2] - minV) / sV), i * 3);
            origin.set(v, i * 3);
        });

        geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(position, 3));
        geometry.setIndex(elements.flat());
        geometry.setAttribute('color', new BufferAttribute(color, 3));
        geometry.setAttribute('origin', new BufferAttribute(origin, 3));

        mesh.geometry = geometry;
        line.geometry = geometry;
    }

    const gui = initGUI();
    gui.add(controls, 'enableRotate');
    gui.add(option, 'scaleZ', 0, 10, 0.1).onChange(() => { renderPlot(option.key) });
    gui.add(option, 'key', Object.keys(data)).onChange(renderPlot);
    gui.add(line, 'visible').name('show line');
    gui.add(mesh.material, 'wireframe').name('mesh wireframe');
    gui.addColor(option, 'lineColor').onChange(() => line.material.color.set(option.lineColor));

    renderPlot(option.key);
}

function minMax(arr) {
    let min = 1e50;
    let max = -1e50;
    for (let v of arr) {
        if (min > v) min = v;
        if (max < v) max = v;
    }
    return [min, max];
}