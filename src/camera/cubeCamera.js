/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-02-17 17:50:21
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-02-18 14:33:50
 * @FilePath: \threejs-demo\src\camera\cubeCamera.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    EquirectangularReflectionMapping,
    Vector3,
    PlaneGeometry,
    MeshPhysicalMaterial,
    CubeCamera,
    WebGLCubeRenderTarget,
    HalfFloatType
} from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import {
    initRenderer,
    initOrbitControls,
    initScene,
    resize,
    initPerspectiveCamera,
    initLoader,
    Image_Path,
    Model_Path,
    HALF_PI,
    initAmbientLight,
    initDirectionLight,
    initStats
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(-9, 2, 0));

    const scene = initScene();

    const stats = initStats();

    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(0, 5, 10);
    scene.add(light);

    const rgbELoader = new RGBELoader();
    rgbELoader.load(`../../${Image_Path}/hdr/OutdoorField.hdr`, (texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
    })

    const loader = initLoader();
    loader.load(`../../${Model_Path}/su7.glb`, (model) => {
        scene.add(model.scene.children[0]);
    });

    const controls = initOrbitControls(camera, renderer.domElement);

    const cubeTarget = new WebGLCubeRenderTarget(1000, {
        type:HalfFloatType
    });
    const cubeCamera = new CubeCamera(0.1, 100, cubeTarget);

    const plane = new Mesh(new PlaneGeometry(10, 10), new MeshPhysicalMaterial({
        envMap: cubeTarget.texture,
        roughness: 0.05,
        metalness: 1
    }));
    plane.rotation.x = -HALF_PI;
    scene.add(plane);



    function render() {
        controls.update();
        cubeCamera.position.copy(camera.position);
        cubeCamera.position.y *= -1;
        cubeCamera.update(renderer, scene);
        renderer.render(scene, camera);
        stats.update();
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);

}