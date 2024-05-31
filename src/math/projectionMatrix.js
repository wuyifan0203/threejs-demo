/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-05-21 17:18:04
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-05-29 10:51:44
 * @FilePath: /threejs-demo/src/math/projectionMatrix.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */


import {
    BoxGeometry,
    CameraHelper,
    Mesh,
    MeshBasicMaterial,
    OrthographicCamera,
    Vector3,
    Box3
} from '../lib/three/three.module.js';
import {
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
    initScene
} from '../lib/tools/common.js'

window.onload = function () {
    init();
}

function init() {
    const renderer = initRenderer();
    const scene = initScene();

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new OrthographicCamera(-5, 5, 5 / aspect, -5 / aspect, 1, 20);
    camera.up.set(0, 0, 1);
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);


    const mesh = new Mesh(
        new BoxGeometry(120, 2, 1),
        new MeshBasicMaterial({ color: 'red' })
    );

    mesh.frustumCulled = false

    const helper = new CameraHelper(camera);
    mesh.add(helper);

    const renderCamera = initOrthographicCamera(new Vector3(0, 20, 0));
    renderCamera.up.set(0, 0, 1);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    function render() {

        const [width, height] = [window.innerWidth, window.innerHeight];
        orbitControls.update();

        // renderer.setClearColor(0xffffff);
        // renderer.setViewport(0, 0, width, height);
        // renderer.setScissor(0, 0, width, height);
        // helper.visible = true;
        // renderer.render(scene, renderCamera);

        // renderer.setClearColor(0xeeeeee);
        // renderer.clearDepth();

        // renderer.setScissorTest(true);
        // renderer.setViewport(0, 0, width * 0.3, height * 0.3);
        // renderer.setScissor(0, 0, width * 0.3, height * 0.3);
        // helper.visible = false;
        // renderer.render(scene, camera);

        // renderer.setScissorTest(false);

        // case 2
        renderer.render(scene, camera);
        // helper.update();

    }

    const { left, right, top, bottom, near, far, zoom, projectionMatrix } = camera.clone()

    console.log({
        left,
        right,
        top,
        bottom,
        near,
        far,
        zoom,
        projectionMatrix
    });

    // function addObject(mesh) {
    //     mesh.geometry.boundingBox === null && mesh.geometry.computeBoundingBox();
    //     if (!testOverFrustum(camera, mesh)) {
    //         updateCameraFrustum(camera, mesh);
    //         helper.update();
    //     }
    //     scene.add(mesh);
    // }
    // addObject(new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial({ color: "yellow" })))
    // addObject(mesh);

    scene.add(mesh);

    renderer.setAnimationLoop(render);
}
const v1 = new Vector3();
const v2 = new Vector3();
const _cameraBox = new Box3();

const _box = new Box3();

function testOverFrustum({ left, right, top, bottom, near, far }, mesh) {
    v1.set(right, top, far);
    v2.set(left, bottom, near);
    _cameraBox.set(v1, v2);

    _box.copy(mesh.geometry.boundingBox);
    _box.applyMatrix4(mesh.matrixWorld);

    return _cameraBox.containsBox(mesh.geometry.boundingBox)
}


function updateCameraFrustum(camera, mesh) {
    const rangeX = camera.right - camera.left;
    const rangeY = camera.top - camera.bottom;
    const rangeZ = camera.far - camera.near;

    const currentX = _box.max.x - _box.min.x;
    const currentY = _box.max.y - _box.min.y;
    const currentZ = _box.max.z - _box.min.z;

    const [xRes, yRes, zRes] = [currentX / rangeX, currentY / rangeY, currentZ / rangeZ];

    const scale = Math.max(xRes, yRes, zRes)

    console.log(scale);

    if (scale > 1) {
        v1.set(rangeX, rangeY, rangeZ).addScalar(scale);
        camera.near = 1;
        camera.far = v1.z - 1;
        camera.left *= scale;
        camera.right *= scale;
        camera.top *= scale;
        camera.bottom *= scale;

        camera.zoom = camera.zoom * scale;

        camera.updateProjectionMatrix();

        const { left, right, top, bottom, near, far, zoom, projectionMatrix } = camera.clone();

        console.log({
            left,
            right,
            top,
            bottom,
            near,
            far,
            zoom,
            projectionMatrix
        });
    }
}
