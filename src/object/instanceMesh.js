/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-30 14:42:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-04-30 18:02:15
 * @FilePath: /threejs-demo/src/object/instanceMesh.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Object3D,
    Vector3,
    InstancedMesh,
    ConeGeometry,
    CameraHelper,
    Mesh,
    MeshStandardMaterial,
    Matrix4,
} from '../lib/three/three.module.js';

import {
    initRenderer,
    initOrthographicCamera,
    initScene,
    initOrbitControls,
    initAmbientLight,
    initDirectionLight,
    initCoordinates,
    initGUI
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, -3, 10).setLength(1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    const scene = initScene();

    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(100, -100, 100);
    light.shadow.camera.far = 300;
    light.shadow.camera.near = 1;
    light.shadow.camera.left = -200;
    light.shadow.camera.right = 200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    light.shadow.mapSize.width = 10240;
    light.shadow.mapSize.height = 10240;
    scene.add(light);

    const controls = initOrbitControls(camera, renderer.domElement);
    const coord = initCoordinates();
    scene.add(coord);

    const geometry = new ConeGeometry(1.5, 4, 12, 1);
    geometry.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
    const meshMaterial = new MeshStandardMaterial({ color: '#cccccc', roughness: 0.1 });

    const instanceMaterial = new MeshStandardMaterial({ color: '#aaaaaa', roughness: 0.5 });

    const instancedMesh = new InstancedMesh(geometry, instanceMaterial, 10000);
    instancedMesh.receiveShadow = instancedMesh.castShadow = true;
    scene.add(instancedMesh);

    const gui = initGUI();
    const drawCallGUI = gui.add(renderer.info.render, 'calls').name('Draw Call Times:');
    drawCallGUI.disable();

    // scene.add(new CameraHelper(light.shadow.camera));

    const dummy = new Object3D();
    for (let j = 0, k = instancedMesh.count, q = Math.floor(Math.sqrt(k)), p = q / 2; j < k; j++) {
        const x = j % q;
        const y = Math.floor(j / q);

        dummy.position.set((x - p) * 4, (y - p) * 4, 0);
        dummy.rotation.set(x * 0.1, y * 0.1, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(j, dummy.matrix);
    }

    const mesh = new Mesh(geometry, meshMaterial);
    scene.add(mesh);



    function render() {
        renderer.render(scene, camera);
        controls.update();
        drawCallGUI.setValue(renderer.info.render.calls);
    }

    renderer.setAnimationLoop(render)
}
