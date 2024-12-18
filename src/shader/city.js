/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-12-03 15:13:16
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-10 18:42:52
 * @FilePath: \threejs-demo\src\shader\city.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Box3,
    Color,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    Uniform,
    Vector2,
    Vector3,
} from "three";
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
    QUARTER_PI,
    HALF_PI,
} from "../lib/tools/index.js";

import { Tween, update } from '../lib/other/tween.esm.js';
import g from "../lib/util/lil-gui.module.min.js";

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
    // orbitControls.autoRotate = true;

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


    city.material.onBeforeCompile = (materialParams) => {
        city.geometry.computeBoundingBox();
        cityBox.copy(city.geometry.boundingBox);
        cityBox.applyMatrix4(city.matrixWorld);
        cityBox.getCenter(cityCenter);
        cityBox.getSize(citySize);

        materialParams.uniforms['uMinHeightAndRange'] = new Uniform(new Vector2(cityBox.min.y, citySize.y));
        injectVPosition(materialParams);
        useGradation(materialParams);
        useScanLine(materialParams);
    }

    land.material.onBeforeCompile = (materialParams) => {
        injectVPosition(materialParams);
        useScanCircle(materialParams);
        useRadar(materialParams)
    }

    function useGradation(params) {
        params.uniforms['uTopColor'] = { value: new Color('#a9ff00') };
        params.fragmentShader = params.fragmentShader.replace(
            V_INJECT_END,
            /*glsl*/`
            uniform vec2 uMinHeightAndRange;
            uniform vec3 uTopColor;
            ${V_INJECT_END}
            `
        );

        params.fragmentShader = params.fragmentShader.replace(
            F_INJECT_END,
            /*glsl*/`
            float scale = (vWorldPosition.y - uMinHeightAndRange.x) / (uMinHeightAndRange.y * 0.3);
            diffuseColor.rgb = mix( diffuseColor.rgb, uTopColor, scale );
            ${F_INJECT_END}
            `
        )
    }

    function useScanLine(params) {
        params.uniforms['uTime'] = { value: 0 };
        params.uniforms['uLineSpeed'] = { value: 10.0 };
        params.uniforms['uLineWidth'] = { value: 0.5 };
        params.uniforms['uLineColor'] = { value: new Color('#ffffff') };

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
            float insideLine  = step(distanceToBottom, vWorldPosition.y) * step(vWorldPosition.y, scanLineToTop);
            diffuseColor.rgb = mix(diffuseColor.rgb, uLineColor, insideLine);
            ${F_INJECT_END}
           `
        );

        const timeTween = new Tween(params.uniforms.uTime).to({ value: 5 }, 5000).repeat(Infinity);
        timeTween.start();
    }

    function useScanCircle(params) {
        const scanCircle = {
            innerRadius: 0,
            radius: 5,
            center: new Vector2(0, 0),
            color: new Color('#0000ff'),
            gradation: 1,
        };

        params.uniforms['uScanCircle'] = new Uniform(scanCircle);
        params.fragmentShader = params.fragmentShader.replace(
            V_INJECT_END,
            /*glsl*/`
            struct ScanCircle {
                vec2 center;
                float innerRadius;
                float radius;
                vec3 color;
                float gradation;
            };
            uniform ScanCircle uScanCircle;
            ${V_INJECT_END}
            `
        );

        params.fragmentShader = params.fragmentShader.replace(
            F_INJECT_END,
            /*glsl*/`
            float d = distance(vWorldPosition.xz, uScanCircle.center);
            float outerRadius = uScanCircle.radius + uScanCircle.innerRadius;
            // 是否为圆环部分
            float insideRing = step(uScanCircle.innerRadius, d) * step(d, outerRadius);
            float gradient = smoothstep(uScanCircle.innerRadius, outerRadius, d);
            // 是否开启渐变
            gradient = mix(1.0, gradient, uScanCircle.gradation); 
            diffuseColor.rgb = mix(diffuseColor.rgb, uScanCircle.color, insideRing * gradient);
            ${F_INJECT_END}
            `
        )

        const timeTween = new Tween(params.uniforms.uScanCircle.value).to({ innerRadius: 30 }, 1000).repeat(Infinity);
        timeTween.start();
    }

    function useRadar(params) {
        const radar = {
            center: new Vector2(50, 50),
            radius: 40,
            color: new Color('#ff0000'),
            speed: 1,
            angleLength: HALF_PI,
            clockwise: 1
        };

        params.uniforms['uRadar'] = new Uniform(radar);
        params.uniforms['uTime'] = new Uniform(0);

        params.fragmentShader = params.fragmentShader.replace(
            V_INJECT_END,
            /*glsl*/`
            struct Radar {
                vec2 center;
                float radius;
                vec3 color;
                float speed;
                float angleLength;
                float clockwise;
            };
            uniform Radar uRadar;
            uniform float uTime;

            mat2 rotate2D(float angle){
                float c = cos(angle);
                float s = sin(angle);

                return mat2(c,-s,s,c);
            }

            float useRadar(vec2 uv, Radar radar){
                vec2 pos = rotate2D(uTime * radar.speed * radar.angleLength) * (uv - radar.center);
                if(radar.radius >= length(pos)){
                    float theta = mod(-1.0 * atan(pos.y,pos.x), PI);
                    float gradient = clamp(1.0 - theta / radar.angleLength, 0.0, 1.0);

                    return gradient;
                }else return 0.0;
            }
            ${V_INJECT_END}
            `
        );

        params.fragmentShader = params.fragmentShader.replace(
            F_INJECT_END,
            /*glsl*/`
            float radarEffect = useRadar(vWorldPosition.xz, uRadar);
            diffuseColor.rgb = mix(diffuseColor.rgb,uRadar.color, step(0.0, radarEffect) * radarEffect);
            ${F_INJECT_END}
            `
        )


        const timeTween = new Tween(params.uniforms.uTime).to({ value: 10 }, 3200).repeat(Infinity);
        timeTween.start();
    }



    return model;
}

function injectVPosition(materialParams) {
    const defineVPosition = /*glsl*/`
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    `;
    const vPosition = /*glsl*/`
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position,1.)).xyz;
    `;
    const includeCommon = '#include <common>';
    const includeUV = '#include <uv_vertex>';
    const diffuseColor = 'vec4 diffuseColor = vec4( diffuse, opacity );';
    if (!materialParams.vertexShader.includes(defineVPosition)) {
        if (materialParams.vertexShader.includes(V_INJECT_END)) {
            materialParams.vertexShader = materialParams.vertexShader.replace(
                V_INJECT_END,
                /*glsl*/`
                ${defineVPosition}
                ${V_INJECT_END}
                `
            )
        } else {
            materialParams.vertexShader = materialParams.vertexShader.replace(
                includeCommon,
                /*glsl*/`
                ${includeCommon}
                ${V_INJECT_START}
                ${defineVPosition}
                ${V_INJECT_END}
                `
            )
        }
    }
    if (!materialParams.vertexShader.includes(vPosition)) {
        if (materialParams.vertexShader.includes(F_INJECT_END)) {
            materialParams.vertexShader = materialParams.vertexShader.replace(
                F_INJECT_END,
                /*glsl*/`
                ${vPosition}
                ${F_INJECT_END}
                `
            )
        } else {
            materialParams.vertexShader = materialParams.vertexShader.replace(
                includeUV,
                /*glsl*/`
                ${includeUV}
                ${F_INJECT_START}
                ${vPosition}
                ${F_INJECT_END}
                `
            )
        }
    }

    if (!materialParams.fragmentShader.includes(defineVPosition)) {
        if (materialParams.fragmentShader.includes(V_INJECT_END)) {
            materialParams.fragmentShader = materialParams.fragmentShader.replace(
                V_INJECT_END,
                /*glsl*/`
                ${defineVPosition}
                ${V_INJECT_END}
                `
            )
        } else {
            materialParams.fragmentShader = materialParams.fragmentShader.replace(
                includeCommon,
                /*glsl*/`
                ${includeCommon}
                ${V_INJECT_START}
                ${defineVPosition}
                ${V_INJECT_END}
                `
            )
        }

    }

    if (!materialParams.fragmentShader.includes(F_INJECT_END)) {
        materialParams.fragmentShader = materialParams.fragmentShader.replace(
            diffuseColor,
            /*glsl*/`
            ${diffuseColor}
            ${F_INJECT_START}
            ${F_INJECT_END}
            `
        )
    }
}