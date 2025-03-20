/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-19 17:22:38
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-20 10:21:52
 * @FilePath: \threejs-demo\src\geometry\roundBox.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    CanvasTexture,
    MeshStandardMaterial,
    NormalBlending,
    AdditiveBlending,
    SubtractiveBlending,
    MultiplyBlending,
    NoBlending,
} from 'three';
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initTrackballControls,
    initScene,
    resize,
    initAmbientLight,
    initDirectionLight,
    HALF_PI,
    PI,
    initGUI
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(10, 10, 0);
    camera.add(light);
    scene.add(camera);
    const grid = initCustomGrid(scene);
    grid.material.depthWrite = true;

    const controls = initTrackballControls(camera, renderer.domElement);
    controls.panSpeed = 3;
    controls.zoomSpeed = 1;
    controls.rotateSpeed = 3;


    const params = {
        color: 0xeeeeee,
        transparent: true,
        opacity: 0.6,
        side: 0,
        metalness: 0.5,
        roughness: 0.8,
        blending: NormalBlending,
        size: 3,
        radius: 0.4,
        segments: 3
    };

    const materials = ['LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'FRONT', 'BACK'].map((key) => {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 150, 150);
        ctx.fillStyle = '#000';
        ctx.font = '30px Arial bold';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const textWidth = ctx.measureText(key).width;
        ctx.fillText(key, (150 - textWidth) / 2 + textWidth / 2, 80);

        const texture = new CanvasTexture(canvas);
        return new MeshStandardMaterial({ map: texture });
    })

    const mesh = new Mesh(new RoundedBoxGeometry(), materials);
    scene.add(mesh);

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    function updateGeometry() {
        const geometry = new RoundedBoxGeometry(params.size, params.size, params.size, params.segments, params.radius,);
        geometry.rotateX(HALF_PI);
        geometry.rotateZ(PI);
        mesh.geometry.dispose();
        mesh.geometry = geometry;
    }

    updateGeometry();

    function updateMaterial() {
        materials.forEach((material) => {
            material.color.set(params.color);
            material.transparent = params.transparent;
            material.opacity = params.opacity;
            material.side = params.side;
            material.metalness = params.metalness;
            material.roughness = params.roughness;
            material.blending = params.blending;
            material.needsUpdate = true;
        })
    }

    updateMaterial();

    const gui = initGUI();
    gui.add(params, 'size', 1, 10, 0.1).onChange(updateGeometry);
    gui.add(params, 'radius', 0, 1, 0.01).onChange(updateGeometry);
    gui.add(params, 'segments', 1, 10, 1).onChange(updateGeometry);
    gui.addColor(params, 'color').onChange(updateMaterial);
    gui.add(params, 'transparent').onChange(updateMaterial);
    gui.add(params, 'opacity', 0, 1, 0.01).onChange(updateMaterial);
    gui.add(params, 'side', {
        'FrontSide': 0,
        'BackSide': 1,
        'DoubleSide': 2
    }).onChange(updateMaterial);
    gui.add(params, 'metalness', 0, 1, 0.01).onChange(updateMaterial);
    gui.add(params, 'roughness', 0, 1, 0.01).onChange(updateMaterial);
    gui.add(params, 'blending', {
        NoBlending,
        NormalBlending,
        AdditiveBlending,
        SubtractiveBlending,
        MultiplyBlending
    }).onChange(updateMaterial);

    resize(renderer, camera);
}