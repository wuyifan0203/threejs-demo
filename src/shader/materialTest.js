/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date:  2023-05-10 18:26:20
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-05 17:24:22
 * @FilePath: /threejs-demo/src/shader/materialTest.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector3,
    Mesh,
    BoxGeometry,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initPerspectiveCamera,
    initOrbitControls,
    initGUI,
    resize,
    initScene
} from '../lib/tools/index.js';

import { BasicMaterial } from './material/basicMaterial.js'

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({ logarithmicDepthBuffer: true });
    const camera = initPerspectiveCamera(new Vector3(0, 0, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const scene = initScene();

    renderer.setClearColor(0xffffff);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const material = new BasicMaterial();
    material.uniforms.color.value.set(1.0,0.0,0.0);

    const geometry = new BoxGeometry(10, 10, 10);

    const mesh = new Mesh(geometry, material);

    scene.add(mesh);

    resize(renderer, camera);


    function render() {
        orbitControls.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();
    gui.add(material.uniforms.color.value, 'x',0.0,1.0,0.1).name('R').onChange(update);
    gui.add(material.uniforms.color.value, 'y',0.0,1.0,0.1).name('G').onChange(update);
    gui.add(material.uniforms.color.value, 'z',0.0,1.0,0.1).name('B').onChange(update);

    function update() {
        material.needsUpdate = true
    }

}
