/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-25 16:59:29
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-26 13:19:59
 * @FilePath: \threejs-demo\src\algorithms\contain.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector3,
    Mesh,
    IcosahedronGeometry,
    MeshStandardMaterial,
    DodecahedronGeometry
} from '../lib/three/three.module.js';
import {
    initScene,
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initDirectionLight,
    initOrbitControls,
    initGUI,
    initAxesHelper
} from '../lib/tools/common.js';
import { isContain } from './collision.js';


window.onload = function () {
    init()
}

function init() {
    const scene = initScene();
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(50, -50, 100));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    initCustomGrid(scene, 100, 100);
    initAxesHelper(scene);

    const light = initDirectionLight();
    light.position.copy(camera.position)

    const orbitControls = initOrbitControls(camera, renderer.domElement)
    scene.add(light);

    const meshA = new Mesh(
        new IcosahedronGeometry(5, 0),
        new MeshStandardMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            side: 2
        })
    );

    const meshB = new Mesh(
        new DodecahedronGeometry(3, 0),
        new MeshStandardMaterial({
            color: 0xfffff00,
        })
    );

    scene.add(meshA);
    scene.add(meshB);


    function render() {
        orbitControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
    update();

    const gui = initGUI();

    function update() {
        if (isContain(meshA, meshB)) {
            meshB.material.color.set(0x00ff00);
        } else {
            meshB.material.color.set(0xff0000);
        }
    }

    gui.add(meshB.position, 'x', -50, 50, 0.1).name('meshA.position.x').onChange(update);
    gui.add(meshB.position, 'y', -50, 50, 0.1).name('meshA.position.y').onChange(update);
    gui.add(meshB.position, 'z', -50, 50, 0.1).name('meshA.position.z').onChange(update);
}