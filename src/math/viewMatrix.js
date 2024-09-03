/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-05-08 10:54:14
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-09-03 10:56:04
 * @FilePath: /threejs-demo/src/math/viewMatrix.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector3,
    ConeGeometry,
    Clock,
    Matrix4,
    MeshStandardMaterial,
    SphereGeometry,
    InstancedMesh,
    Object3D,
    InstancedBufferAttribute,
} from '../lib/three/three.module.js';

import {
    initRenderer,
    initOrthographicCamera,
    initScene,
    initOrbitControls,
    initAmbientLight,
    initDirectionLight,
    resize,
} from '../lib/tools/index.js';

window.onload = function () {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.zoom = 0.25;
    camera.updateProjectionMatrix();
    const scene = initScene();
    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(0, 0, 100);
    scene.add(light);

    renderer.setClearColor(0xffffff);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const geometry = new ConeGeometry(2, 3, 8);
    geometry.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
    const material = new MeshStandardMaterial({ color: '#cccccc' });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;

    const sphereMesh = new Mesh(new SphereGeometry(1, 32, 32), new MeshStandardMaterial({ color: '#ff0000' }));
    sphereMesh.position.z = 8;
    scene.add(sphereMesh);
    scene.add(mesh);

    const fixedRadius = 16;
    const fixedInstancedMesh = new InstancedMesh(geometry, material, fixedRadius);
    fixedInstancedMesh.instanceColor = new InstancedBufferAttribute(new Float32Array(fixedRadius * 3), 3);
    scene.add(fixedInstancedMesh);

    const movedRadius = 32;
    const movedInstancedMesh = new InstancedMesh(geometry, material, movedRadius);
    scene.add(movedInstancedMesh);

    const dummy = new Object3D();
    const clock = new Clock();
    function render() {
        const time = clock.getElapsedTime();
        renderer.render(scene, camera);
        orbitControl.update();
        sphereMesh.position.x = Math.sin(time) * 10;
        sphereMesh.position.y = Math.cos(time) * 10;
        updateFixedInstanceMesh()
        updateMovedInstanceMesh(time)
        mesh.lookAt(sphereMesh.position);

        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);


    function updateFixedInstanceMesh() {
        for (let i = 0, offset = Math.PI * 2 / fixedRadius; i < fixedRadius; i++) {
            const angle = i * offset;
            dummy.position.set(Math.sin(angle) * fixedRadius, Math.cos(angle) * fixedRadius, 0);
            dummy.lookAt(sphereMesh.position);
            dummy.updateMatrix();

            fixedInstancedMesh.setMatrixAt(i, dummy.matrix);

            if (dummy.position.distanceToSquared(sphereMesh.position) > 110) {
                fixedInstancedMesh.instanceColor.setXYZ(i, 0.8, 0.8, 0.8);
            } else {
                fixedInstancedMesh.instanceColor.setXYZ(i, 1, 0.0, 0.0);
            }

        }

        fixedInstancedMesh.instanceColor.needsUpdate = true;
        fixedInstancedMesh.instanceMatrix.needsUpdate = true;
    }

    function updateMovedInstanceMesh(time) {
        time = time * 0.1; // 加速
        for (let i = 0, offset = Math.PI * 2 / movedRadius; i < movedRadius; i++) {
            const angle = i * offset;
            dummy.position.set(Math.sin(angle + time) * movedRadius, Math.cos(angle + time) * movedRadius, 0);
            dummy.lookAt(sphereMesh.position);
            dummy.updateMatrix();

            movedInstancedMesh.setMatrixAt(i, dummy.matrix);
        }

        movedInstancedMesh.instanceMatrix.needsUpdate = true;

    }
}  