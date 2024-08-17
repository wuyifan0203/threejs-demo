/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-08-17 16:28:59
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-08-17 18:02:10
 * @FilePath: /threejs-demo/src/intersection/selectinstanceMesh.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Object3D,
    Vector3,
    InstancedMesh,
    ConeGeometry,
    Group,
    Mesh,
    Vector2,
    MeshStandardMaterial,
    Matrix4,
    Raycaster,
    MeshNormalMaterial,
} from '../lib/three/three.module.js';

import {
    initRenderer,
    initOrthographicCamera,
    initScene,
    initOrbitControls,
    initAmbientLight,
    initDirectionLight,
    initGUI,
    resize
} from '../lib/tools/index.js';
import { TransformControls } from '../lib/three/TransformControls.js';

window.onload = () => {
    init();
};



function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, -3, 10).setLength(1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.zoom = 0.5;
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


    const geometry = new ConeGeometry(1.5, 4, 12, 1);
    geometry.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));

    const instanceMaterial = new MeshStandardMaterial({ color: '#aaaaaa', roughness: 0.5 });

    const instancedMesh = new InstancedMesh(geometry, instanceMaterial, 10000);
    instancedMesh.receiveShadow = instancedMesh.castShadow = true;
    scene.add(instancedMesh);

    const raycaster = new Raycaster();

    const dummy = new Object3D();
    for (let j = 0, k = instancedMesh.count, q = Math.floor(Math.sqrt(k)), p = q / 2; j < k; j++) {
        const x = j % q;
        const y = Math.floor(j / q);

        dummy.position.set((x - p) * 4, (y - p) * 4, 0);
        dummy.rotation.set(x * 0.1, y * 0.1, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(j, dummy.matrix);
    }

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    const mouse = new Vector2();

    const selectMesh = new Mesh(geometry, new MeshNormalMaterial());
    selectMesh.scale.set(1.1, 1.1, 1.1)
    scene.add(selectMesh);

    const selectMatrix = new Matrix4();
    window.addEventListener('dblclick', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(instancedMesh, true);
        console.log(intersects);
        if (intersects.length > 0) {
            const instanceId = intersects[0].instanceId;
            console.log(instanceId);
            instancedMesh.getMatrixAt(instanceId, selectMatrix);
            selectMesh.matrixWorld.copy(instancedMesh.matrixWorld);
            selectMesh.matrixWorld.multiplyMatrices(instancedMesh.matrixWorld, selectMatrix);
            selectMatrix.decompose(selectMesh.position, selectMesh.quaternion, selectMesh.scale);
            selectMesh.scale.set(1.01, 1.01, 1.01);

            selectMesh.visible = true;
        } else {
            selectMesh.visible = false;
        }
    })

    selectMesh.visible = false;


    render();
    resize(renderer, camera);

}
