/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-12 13:51:27
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-04-12 16:13:36
 * @FilePath: /threejs-demo/src/algorithms/OctreeDemo.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector3,
    Mesh,
    SphereGeometry,
    Float32BufferAttribute,
    MeshStandardMaterial,
    TorusKnotGeometry,
    Sphere,
    MeshBasicMaterial,
    BufferGeometry
} from 'three';
import {
    initScene,
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initDirectionLight,
    initOrbitControls,
    initGUI
} from '../lib/tools/common.js';

import { Octree } from 'three/examples/jsm/data/Octree.js';

window.onload = function () {
    init()
}

function init() {
    const scene = initScene();
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(0, 0, 100));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    initCustomGrid(scene, 100, 100);

    const light = initDirectionLight();
    light.position.copy(camera.position)

    const orbitControls = initOrbitControls(camera, renderer.domElement)
    scene.add(light);

    const sphereMesh = createSphere(5);
    const torusKnotMesh = createTorusKnot();

    scene.add(sphereMesh);
    scene.add(torusKnotMesh);


    renderer.setAnimationLoop(() => {
        orbitControls.update();
        renderer.render(scene, camera);
    })

    const sphere = new Sphere();

    const octree = new Octree();

    octree.fromGraphNode(sphereMesh);

    torusKnotMesh.geometry.computeBoundingSphere();

    sphere.copy(torusKnotMesh.geometry.boundingSphere);
    sphere.applyMatrix4(torusKnotMesh.matrixWorld);


    const triangles = [];

    octree.getSphereTriangles(sphere, triangles);

    console.log(triangles);

    const buffer = []
    triangles.forEach(triangle => {
        buffer.push(triangle.a.x, triangle.a.y, triangle.a.z);
        buffer.push(triangle.b.x, triangle.b.y, triangle.b.z);
        buffer.push(triangle.c.x, triangle.c.y, triangle.c.z);
    });

    const resultGeometry = new BufferGeometry();
    resultGeometry.setAttribute('position', new Float32BufferAttribute(buffer, 3));
    const result = new Mesh(resultGeometry, new MeshBasicMaterial({ color: 0xffff00, }));

    scene.add(result);

    const gui = initGUI();
    gui.add(sphereMesh.material, 'wireframe');
    gui.add(torusKnotMesh.material, 'wireframe');



}

function createSphere(radius) {
    const geometry = new SphereGeometry(radius, 32, 32);
    const colors = new Array(geometry.getIndex().count * 3);
    for (let i = 0; i < colors.length; i = i + 3) {
        colors[i] = 0.0;
        colors[i + 1] = 0.0;
        colors[i + 2] = 1.0;
    }
    const colorBuffer = new Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorBuffer);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ vertexColors: true, wireframe: true }));

    return mesh;
}

function createTorusKnot() {
    const geometry = new TorusKnotGeometry(5, 2, 100, 16);
    const colors = new Array(geometry.getIndex().count * 3);
    for (let i = 0; i < colors.length; i = i + 3) {
        colors[i] = 1.0;
        colors[i + 1] = 0.0;
        colors[i + 2] = 0.0;
    }
    const colorBuffer = new Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorBuffer);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ vertexColors: true, wireframe: true }));
    return mesh;
}