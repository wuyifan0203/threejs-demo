/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-12-03 15:13:16
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-04 18:13:16
 * @FilePath: \threejs-demo\src\shader\city.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Box3,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    MeshBasicMaterial,
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
    rainbowColors,
    initAmbientLight,
    initDirectionLight,
} from "../lib/tools/index.js";

import { Tween } from '../lib/other/tween.esm.js';

const loader = initLoader();

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    const scene = initScene();

    const camera = initOrthographicCamera(new Vector3(-1000, 1000, 0));
    camera.zoom = 0.2;
    camera.updateProjectionMatrix();
    initAxesHelper(scene);
    initAmbientLight(scene);
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


    city.material.onBeforeCompile = (args) => {
        addGradation(args);
    }

    function addGradation(args) {
        args.uniforms['uTime'] = { value: 0.0 };
        args.fragmentShader = args.fragmentShader.replace(
            '#include <common>',
            /*glsl*/`
            #include <common>
            uniform float uTime;
            `
        )

        args.fragmentShader = args.fragmentShader.replace(
            'vec4 diffuseColor = vec4( diffuse, opacity );',
            /*glsl*/`
            mix( diffuse, vec3(1.0), uTime);
            vec4 diffuseColor = vec4( diffuse, opacity );
            `
        )

        console.log(args.vertexShader);
        console.log(args.fragmentShader);

        const tween = new Tween(args.uniforms.uTime);
        tween.onUpdate((obj) => {
            console.log(obj.value);
        });
        tween.to({ value: 1 }, 1000).repeat(Infinity).start();
    }



    return model;

}