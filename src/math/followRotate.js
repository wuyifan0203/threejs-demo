/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-06-07 15:12:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-06-17 20:51:20
 * @FilePath: /threejs-demo/src/math/followRotate.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Matrix4,
    Quaternion,
    Vector3,
    Clock
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
        up: new Vector3(0, 0, 1),
        target: new Vector3(-1, 0, 0)
    },
    NEG_X: {
        up: new Vector3(0, 0, 1),
        target: new Vector3(1, 0, 0)
    },
    POS_Y: {
        up: new Vector3(0, 0, 1),
        target: new Vector3(0, -1, 0)
    },
    NEG_Y: {
        up: new Vector3(0, 0, 1),
        target: new Vector3(0, 1, 0)
    },
    POS_Z: {
        up: new Vector3(0, 1, 0),
        target: new Vector3(0, 0, -1)
    },
    NEG_Z: {
        up: new Vector3(0, -1, 0),
        target: new Vector3(0, 0, 1)
    }
}

const currentQuaternion = new Quaternion();
const targetQuaternion = new Quaternion();
const rotateMatrix = new Matrix4();

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
        rotateMatrix.lookAt(new Vector3(0, 0, 0), directionInfo.target, directionInfo.up);
        targetQuaternion.setFromRotationMatrix(rotateMatrix);
        targetCoord.quaternion.copy(targetQuaternion);
        targetCoord.updateMatrix();
    }


    const viewHelper = initViewHelper(camera, renderer.domElement);
    viewHelper.center.copy(orbitControl.target)

    const o = {
        rotateDirection: 'POS_Z',
        isFollow: true,
        animate: false,
        apply() {
            o.animate = true;
            console.log('apply',o);
        }
    }

    const coord = initCoordinates(10);
    scene.add(coord);
    coord.matrixWorldAutoUpdate = false;
    coord.matrixAutoUpdate = false;

    coord.update = function (dt) {
        const step = dt * Math.PI * 0.1;
        currentQuaternion.rotateTowards(targetQuaternion, step);
        if (currentQuaternion.angleTo(targetQuaternion) === 0) {
            o.animate = false;
        }

        coord.quaternion.copy(currentQuaternion);
        coord.updateMatrix();
    }
    // coord.visible = false



    const clock = new Clock();

    function render() {
        renderer.clear()
        orbitControl.update();
        renderer.render(scene, camera);
        if (o.isFollow) {
            currentQuaternion.copy(camera.quaternion);
            coord.quaternion.copy(currentQuaternion);
            coord.updateMatrix();
        }

        stats.update()
        viewHelper.render(renderer);

        if (o.animate) {
            coord.update(clock.getDelta());
        }
    }
    renderer.setAnimationLoop(render);

    resize(renderer, camera);

    const gui = initGUI();


    gui.add(coord, 'visible');
    gui.add(o, 'rotateDirection', ['POS_X', 'NEG_X', 'POS_Y', 'NEG_Y', 'POS_Z', 'NEG_Z']).onChange((e) => {
        console.log(e);
        targetCoord.applyRotateDirection(e);
    });
    gui.add(o, 'isFollow');
    gui.add(o, 'apply');
}