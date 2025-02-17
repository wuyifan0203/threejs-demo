/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-02-17 17:50:21
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-02-17 19:44:25
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
    imagePath,
    modelPath,
    HALF_PI,
    initAmbientLight,
    initDirectionLight
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(0, 5, 7));

    const scene = initScene();

    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(0, 5, 10);
    scene.add(light);

    const rgbELoader = new RGBELoader();
    rgbELoader.load(`../../${imagePath}/hdr/OutdoorField.hdr`, (texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
    })

    const loader = initLoader();
    loader.load(`../../${modelPath}/su7.glb`, (model) => {
        scene.add(model.scene.children[0]);
    })

    const controls = initOrbitControls(camera, renderer.domElement);

    const cubeTarget = new WebGLCubeRenderTarget(256);
    cubeTarget.texture.type = HalfFloatType;
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
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);

}