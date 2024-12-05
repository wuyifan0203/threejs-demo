/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-12-03 15:13:16
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-05 18:05:22
 * @FilePath: \threejs-demo\src\shader\city.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Box3,
    Color,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    Vector2,
    Vector3,
} from "../lib/three/three.module.js";
import {
    initRenderer,
    initLoader,
    resize,
    initOrbitControls,
    initScene,
    modelPath,
    initClock,
    initOrthographicCamera,
    initAxesHelper,
    initAmbientLight,
    initDirectionLight,
    initFog,
} from "../lib/tools/index.js";

import { Tween, update } from '../lib/other/tween.esm.js';

const V_INJECT_START = '//variable_inject_start';
const V_INJECT_END = '//variable_inject_end';
const F_INJECT_START = '//function_inject_start';
const F_INJECT_END = '//function_inject_end';

const loader = initLoader();

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    const scene = initScene();

    const camera = initOrthographicCamera(new Vector3(425, 325, -1300));
    camera.zoom = 0.53;
    camera.updateProjectionMatrix();
    initAxesHelper(scene);
    initAmbientLight(scene);
    // initFog(scene, 300, 1000, '#ffffff')


    const light = initDirectionLight();
    light.position.set(100, 100, 100);

    const orbitControls = initOrbitControls(camera, renderer.domElement);
    orbitControls.autoRotate = true;

    const cityModel = await createCity();
    cityModel.position.x = 20;
    cityModel.position.z = -50;
    scene.add(cityModel);

    const clock = initClock();
    let delta = 0;
    resize(renderer, camera);
    function render() {
        delta = clock.getDelta();
        orbitControls.update();
        renderer.render(scene, camera);
        update();
        requestAnimationFrame(render);
    }
    render();

}

async function createCity() {
    const model = await loader.loadAsync(`../../${modelPath}/shanghai.FBX`);
    model.scale.set(0.1, 0.1, 0.1);
    model.traverse((child) => child.isMesh && (child.castShadow = child.receiveShadow = true));
    scene.add(model);
    const [city, land, road] = [model.children[3], model.children[1], model.children[0]];
    city.material.color.set('#ff00ff');
    city.material.transparent = true;
    city.material.side = 2;
    city.material.opacity = 0.7;

    road.material.color.set('#ffff00');

    const cityLine = new LineSegments(new EdgesGeometry(city.geometry), new LineBasicMaterial({ color: '#000000' }));
    city.add(cityLine);

    const cityCenter = new Vector3();
    const citySize = new Vector3();
    const cityBox = new Box3();
    city.geometry.computeBoundingBox();
    cityBox.copy(city.geometry.boundingBox);
    cityBox.applyMatrix4(city.matrixWorld);
    cityBox.getCenter(cityCenter);
    cityBox.getSize(citySize);
    console.log('cityBox: ', cityBox);

    city.material.onBeforeCompile = (materialPrams) => {
        materialPrams.uniforms['uMinHeightAndRange'] = { value: new Vector2(cityBox.min.y, citySize.y) };
        console.log(materialPrams.vertexShader);
        console.log(materialPrams.fragmentShader);
        addGradation(materialPrams);
        addScanLine(materialPrams);
        console.log(materialPrams.vertexShader);
        console.log(materialPrams.fragmentShader);
    }

    function addGradation(params) {
        params.uniforms['uTopColor'] = { value: new Color('#a9ff00') };

        params.vertexShader = params.vertexShader.replace(
            '#include <common>',
            /*glsl*/`
            #include <common>
            ${V_INJECT_START}
            varying vec3 vPosition;
            ${V_INJECT_END}
            `
        );
        params.vertexShader = params.vertexShader.replace(
            '#include <uv_vertex>',
            /*glsl*/`
            #include <uv_vertex>
            ${F_INJECT_START}
            vPosition = position;
            ${F_INJECT_END}
            `
        );

        params.fragmentShader = params.fragmentShader.replace(
            '#include <common>',
            /*glsl*/`
            #include <common>
            ${V_INJECT_START}
            uniform vec2 uMinHeightAndRange;
            uniform vec3 uTopColor;
            varying vec3 vPosition;
            ${V_INJECT_END}
            `
        );

        params.fragmentShader = params.fragmentShader.replace(
            'vec4 diffuseColor = vec4( diffuse, opacity );',
            /*glsl*/`
            vec4 diffuseColor = vec4( diffuse, opacity );
            ${F_INJECT_START}
            float scale = (vPosition.z - uMinHeightAndRange.x) / (uMinHeightAndRange.y * 0.3);
            diffuseColor.rgb = mix( diffuseColor.rgb, uTopColor, scale );
            ${F_INJECT_END}
        
            `
        )

    }

    function addScanLine(params) {
        params.uniforms['uTime'] = { value: 0 };
        params.uniforms['uLineSpeed'] = { value: 60.0 };
        params.uniforms['uLineWidth'] = { value: 10.0 };
        params.uniforms['uLineColor'] = { value: new Color('#fffff') };

        params.fragmentShader = params.fragmentShader.replace(
            V_INJECT_END,
            /*glsl*/`
            uniform float uTime;
            uniform float uLineWidth;
            uniform vec3 uLineColor;
            uniform float uLineSpeed;
            ${V_INJECT_END}
            `
        );

        params.fragmentShader = params.fragmentShader.replace(
            F_INJECT_END,
            /*glsl*/`
            float distanceToBottom = mod(uLineSpeed * uTime, uMinHeightAndRange.y);
            float scanLineToTop = distanceToBottom + uLineWidth;
            float insideLine  = step(distanceToBottom, vPosition.z) * step(vPosition.z, scanLineToTop);
            diffuseColor.rgb = mix(diffuseColor.rgb, uLineColor, insideLine);
            ${F_INJECT_END}
           `
        );

        const timeTween = new Tween(params.uniforms.uTime).to({ value: 5 }, 5000).repeat(Infinity);
        timeTween.start();
    }



    return model;

}