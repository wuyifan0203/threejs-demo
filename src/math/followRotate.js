/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-06-07 15:12:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-06-13 20:59:24
 * @FilePath: /threejs-demo/src/math/followRotate.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Matrix4,
    Quaternion,
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

const directionMap = {
    POS_X: {
        up: new Vector3(0,0,1),
        target: new Vector3(1, 0, 0)
    },
    NEG_X: {
        up: new Vector3(0,0,1),
        target: new Vector3(-1, 0, 0)
    }
}

function init() {
    const renderer = initRenderer({});
    renderer.autoClear = false;
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

    const targetCoord = initCoordinates(2);
    scene.add(targetCoord);
    targetCoord.applyRotateDirection = function (direction) {
        const directionInfo = directionMap[direction]
        const matrix = new Matrix4().lookAt(new Vector3(0, 0, 0), directionInfo.target, directionInfo.up);
        const quaternion = new Quaternion().setFromRotationMatrix(matrix);
        targetCoord.quaternion.copy(quaternion);
        targetCoord.updateMatrix();
    }

    const viewHelper = initViewHelper(camera, renderer.domElement);
    viewHelper.center.copy(orbitControl.target)

    const coord = initCoordinates(10);
    scene.add(coord);
    coord.visible = false

    function render() {
        renderer.clear()
        orbitControl.update();
        renderer.render(scene, camera);
        coord.quaternion.copy(camera.quaternion)
        stats.update()
        viewHelper.render(renderer)
    }
    renderer.setAnimationLoop(render);

    resize(renderer, camera);

    const gui = initGUI();

    const o = {
        rotateDirection: 'POS_X'
    }

    gui.add(coord, 'visible');

    gui.add(o, 'rotateDirection', ['POS_X', 'NEG_X']).onChange((e) => { 
        console.log(e);
        targetCoord.applyRotateDirection(e)
    })
}