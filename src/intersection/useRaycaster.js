/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-11 14:39:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-04-25 17:27:29
 * @FilePath: /threejs-demo/src/intersection/useRaycaster.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Float32BufferAttribute,
    SphereGeometry,
    TorusKnotGeometry,
    MeshStandardMaterial,
    Mesh,
    Vector3,
} from 'three';
import {
    initAmbientLight,
    initCustomGrid,
    initDirectionLight,
    initGUI,
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
    initScene
} from '../lib/tools/common.js';

window.onload = function () {
    init();
}

function init() {
    const scene = initScene();
    const camera = initOrthographicCamera(new Vector3(0, 0, 200));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const renderer = initRenderer();
    const light = initDirectionLight();
    light.position.set(0, 100, 100);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const countDom = document.getElementById('count');

    initCustomGrid(scene, 50, 50)

    orbitControls.addEventListener('change', render);

    scene.add(light);
    initAmbientLight(scene);

    const sphere = createSphere(4);

    const torusKnot = createTorusKnot();

    countDom.innerText = sphere.geometry.getIndex().count + torusKnot.geometry.getIndex().count;

    scene.add(sphere);
    scene.add(torusKnot);

    function render() {
        renderer.render(scene, camera);
    }

    render();

    const gui = initGUI();
    gui.add(sphere.material, 'wireframe').name('Sphere wireframe').onChange(render);
    gui.add(torusKnot.material, 'wireframe').name('TorusKnot wireframe').onChange(render);

    getInsertIndex(sphere, torusKnot)

}

function createSphere(radius) {
    const geometry = new SphereGeometry(radius, 32, 32);
    const colors = new Array(geometry.getIndex().count * 3);
    for (let i = 0; i < colors.length; i++) {
        colors[i] = 1.0;
    }
    const colorBuffer = new Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorBuffer);
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ vertexColors: true }));

    return mesh;
}

function createTorusKnot() {
    const geometry = new TorusKnotGeometry(5, 2, 100, 16);
    const colors = new Array(geometry.getIndex().count * 3);
    for (let i = 0; i < colors.length; i++) {
        colors[i] = 0.5;
    }
    const colorBuffer = new Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorBuffer);
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ vertexColors: true }));
    return mesh;
}


function getInsertIndex(sphere, torusKnot) {
    const sphereGeometry = sphere.geometry.clone();
    const torusKnotGeometry = torusKnot.geometry.clone();

    sphereGeometry.applyMatrix4(sphere.matrixWorld);
    torusKnotGeometry.applyMatrix4(torusKnot.matrixWorld);


}
