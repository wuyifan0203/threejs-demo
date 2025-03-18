/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-25 13:54:50
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-07-25 13:55:38
 * @FilePath: /threejs-demo/src/particle/rain2.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    BufferGeometry,
    PointsMaterial,
    Points,
    Vector3,
    Float32BufferAttribute,
    BoxGeometry,
    Mesh,
    MeshNormalMaterial,
    Clock
} from 'three';
import {
    initRenderer,
    resize,
    initScene,
    initOrbitControls,
    initOrthographicCamera,
    initGUI,
    initStats
} from '../lib/tools/index.js';
import { createRandom } from '../lib/tools/math.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(200, 200, 200))
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = initScene();

    const stats = initStats();

    const controls = initOrbitControls(camera, renderer.domElement);
    resize(renderer, camera);
    const geometry = new BufferGeometry();
    const points = new Points(geometry, new PointsMaterial({ color: 0x2196f3, size: 2 }));
    scene.add(points);

    scene.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial({})));

    const options = {
        count: 20000,
        range: 40,
        speed: 10
    }

    const clock = new Clock()
    function render() {
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
        renderGeometry(clock.getDelta())
        stats.update();
        requestAnimationFrame(render);
    }
    render();

    function updateGeometry() {
        geometry.dispose();
        const halfRange = options.range / 2;
        const position = new Float32Array(options.count * 3);
        for (let i = 0, l = options.count; i < l; i++) {
            const vertex = [createRandom(-halfRange, halfRange), createRandom(-halfRange, halfRange), createRandom(0, options.range)]
            position.set(vertex, i * 3);
        }
        geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
    }

    function renderGeometry(dt) {
        const attribute = geometry.getAttribute('position');
        if (!attribute) return
        for (let i = 0, l = attribute.count; i < l; i++) {
            const posZ = attribute.getZ(i)
            if (posZ < 0) {
                attribute.setZ(i, options.range);
            } else {
                attribute.setZ(i, posZ - dt * options.speed);
            }
        }
        attribute.needsUpdate = true;
    }

    updateGeometry();

    const gui = initGUI();
    gui.add(options, 'range', 30, 100).onChange(updateGeometry);
    gui.add(options, 'speed', 0, 100, 0.2);
    gui.add(options, 'count', 1000, 10000).onChange(updateGeometry);
    gui.add(points.material, 'size', 1, 10, 0.2).onChange(() => {
        points.material.needsUpdate = true;
    });



}

