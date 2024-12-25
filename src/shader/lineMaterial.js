/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-12-21 17:46:50
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-25 10:14:20
 * @FilePath: \threejs-demo\src\shader\lineMaterial.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    TextureLoader,
    ShaderMaterial,
    BufferGeometry,
    CatmullRomCurve3,
    Vector3,
    Mesh,
    Shape,
    MeshNormalMaterial,
    TubeGeometry,
    Path,
    Uniform,
    Color
} from "three";
import {
    initRenderer,
    initGUI,
    initScene,
    resize,
    initPerspectiveCamera,
    initOrbitControls,
    vec2ToVec3,
    initClock,
} from "../lib/tools/index.js";

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(0, 50, 0));

    const controls = initOrbitControls(camera, renderer.domElement);

    const scene = initScene();

    const x = 0, y = 0;
    const heartShape = new Shape()
        .moveTo(x + 25, y + 25)
        .bezierCurveTo(x + 25, y + 25, x + 20, y, x, y)
        .bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35)
        .bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95)
        .bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35)
        .bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y)
        .bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

    const curve = new CatmullRomCurve3(vec2ToVec3(heartShape.getPoints(100), 0, 'y'));

    const curveLength = curve.getLength();

    const params = {
        color: '#ff0000',
        gradualColor: '#00ff00',
        lineWidth: 30,
        speed: 60,
    };

    const material = new ShaderMaterial({
        uniforms: {
            uTime: new Uniform(0.0),
            uColor: new Uniform(new Color(params.color)),
            uGradualColor: new Uniform(new Color(params.gradualColor)),
            uSpeed: new Uniform(params.speed),
            uLineWidth: new Uniform(params.lineWidth),
            uLineLength: new Uniform(curveLength)
        },
        vertexShader:/*glsl*/`
            varying vec3 vPosition;
            varying vec2 vUv;
            void main() {
                vPosition = position;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader:/*glsl*/`
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uGradualColor;
            uniform float uSpeed;
            uniform float uLineWidth;
            uniform float uLineLength;
            varying vec3 vPosition;
            varying vec2 vUv;

            void main() {
                float d = mod(vUv.x * uLineLength - uSpeed * uTime, uLineLength);
                // 1// 基础逻辑
                // if(abs(d) < uLineWidth){
                //     gl_FragColor = vec4(uGradualColor, 1.0);
                // }else{
                //     gl_FragColor = vec4(uColor, 1.0);
                // }
                // 2//加入渐变色
                // if(abs(d) < uLineWidth){
                //     vec3 color = mix(uColor, uGradualColor,  d / uLineWidth);
                //     gl_FragColor = vec4(color, 1.0);
                // }else{
                //     gl_FragColor = vec4(uColor, 1.0);
                // }
                // 3// 优化if else
                float gradation = d / uLineWidth;
                float inRange = step(d, uLineWidth);
                vec3 color = mix(uColor, uGradualColor,  gradation * inRange); 
                gl_FragColor = vec4(color, 1.0);
            }
        `,
    });

    const lineTube = new Mesh(new TubeGeometry(curve, 200, 0.5), material);
    lineTube.geometry.computeBoundingBox();
    const center = new Vector3();
    lineTube.geometry.boundingBox.getCenter(center);
    lineTube.geometry.translate(-center.x, -center.y, -center.z);
    lineTube.scale.set(0.3, 0.3, 0.3);
    scene.add(lineTube);


    const clock = initClock();
    function render() {
        controls.update();
        renderer.render(scene, camera);
        material.uniforms.uTime.value = clock.getElapsedTime();
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, [camera]);

    const gui = initGUI();
    gui.add(params, 'speed', 0, 100).onChange(() => {
        material.uniforms.uSpeed.value = params.speed;
    });
    gui.addColor(params, 'color').onChange((e) => {
        material.uniforms.uColor.value.set(e);
    });
    gui.addColor(params, 'gradualColor').onChange((e) => {
        material.uniforms.uGradualColor.value.set(e);
    });
    gui.add(params, 'lineWidth', 0, 100).onChange(() => {
        material.uniforms.uLineWidth.value = params.lineWidth;
    });
}