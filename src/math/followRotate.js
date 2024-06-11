/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-06-07 15:12:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-06-11 20:23:11
 * @FilePath: /threejs-demo/src/math/followRotate.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector3,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initGUI,
    initAmbientLight,
    initStats,
    initDirectionLight,
    initCustomGrid,
    resize,
    initViewHelper,
    initCoordinates
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});
    const camera = initOrthographicCamera(new Vector3(0, 0, 500));
    camera.up.set(0, 0, 1)
    camera.zoom = 1;
    const scene = initScene();

    const stats = initStats()
    initAmbientLight(scene);
    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    scene.add(light);

    initCustomGrid(scene);

    const viewHelper = initViewHelper(camera, renderer.domElement);
    viewHelper.center.copy(orbitControl.target)

    const coord = initCoordinates(5);
    scene.add(coord)

    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
        coord.quaternion.copy(camera.quaternion)
        stats.update()
        viewHelper.render(renderer)
    }
    renderer.setAnimationLoop(render);

    resize(renderer, camera)
}