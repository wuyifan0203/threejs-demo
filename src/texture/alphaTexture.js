/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-18 17:00:40
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-18 19:56:48
 * @FilePath: \threejs-demo\src\texture\alphaTexture.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    PlaneGeometry,
    MeshStandardMaterial,
    InstancedMesh,
    Object3D,
    MathUtils
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    initLoader,
    Image_Path,
    initDirectionLight,
    initAmbientLight
} from '../lib/tools/index.js';

const { randFloat } = MathUtils;

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(0, 10, 10);
    scene.add(light);

    const controls = initOrbitControls(camera, renderer.domElement);

    const loader = initLoader();
    const alphaMap = loader.load(`../../${Image_Path}/door/grass1.webp`);

    const dummy = new Object3D();

    const mesh = new InstancedMesh(
        new PlaneGeometry(2, 1),
        new MeshStandardMaterial({
            alphaMap,
            color: '#13ff13',
            side: 2,
            alphaTest: 0.5,   
            transparent: true,
            opacity:1,
            premultipliedAlpha: true
        }),
        800
    );

    for (let i = 0; i < 800; i++) {
        dummy.position.set(randFloat(-5, 5), 0, randFloat(-5, 5));
        dummy.rotation.y = randFloat(0, Math.PI * 2);
        dummy.scale.setScalar(randFloat(0.5, 1));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }

    scene.add(mesh);


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
}