/*
 * @Author: wuyifan wuyifan@udschina.com
 * @Date: 2025-07-11 16:48:39
 * @LastEditors: wuyifan wuyifan@udschina.com
 * @LastEditTime: 2025-07-14 17:32:15
 * @FilePath: \threejs-demo\src\shader\map.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    MeshNormalMaterial,
    ExtrudeGeometry,
    Shape,
    Vector2,
    Vector3,
    TubeGeometry,
    CatmullRomCurve3,
    CanvasTexture,
    RepeatWrapping,
    MeshBasicMaterial,
    PlaneGeometry,
    ShaderMaterial,
    Uniform,
    Color
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize,
    loadJSON,
    transformShape,
    vec2ToVec3
} from '../lib/tools/index.js';
import { convertGeoJSON } from '../lib/tools/geoConvert.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, -100, 100));
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);

    const dataPath = `../../public/data`;
    const conuntryData = await loadJSON(`${dataPath}/country.json`);
    const provinceData = await loadJSON(`${dataPath}/province.json`);

    const countryGeo = convertGeoJSON(conuntryData);
    const provinceGeo = convertGeoJSON(provinceData);
 

    const controls = initOrbitControls(camera, renderer.domElement);

    const faceMaterial = new MeshNormalMaterial();
    const sideMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
    const offset = new Vector2().copy(provinceGeo.center).negate();

    provinceData.features.forEach((province) => {
        province.geometry.shapes.forEach((points) => {
            transformShape({ shape: points }, 'translate', offset);
            transformShape({ shape: points }, 'scale', new Vector2(1, -1));

            const geometry = new ExtrudeGeometry(new Shape(points));
            const mesh = new Mesh(geometry, [faceMaterial, sideMaterial]);
            mesh.userData = province.properties;
            scene.add(mesh);
        })
    });

    const countryShape = conuntryData.features[0].geometry.shapes[0];
    transformShape({ shape: countryShape }, 'translate', countryGeo.center.negate());
    transformShape({ shape: countryShape }, 'scale', new Vector2(1, -1));
    const geometry = new TubeGeometry(new CatmullRomCurve3(vec2ToVec3(countryShape), true), 2000, 0.1);
    const countryMesh = new Mesh(geometry, new MeshNormalMaterial());
    countryMesh.position.z = 4;
    scene.add(countryMesh);



    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    const planeTexture = new CanvasTexture(createCanvas());
    planeTexture.wrapS = planeTexture.wrapT = RepeatWrapping;
    planeTexture.repeat.set(100, 100);

    const planeMaterial = new ShaderMaterial({
        uniforms: {
            uTime: new Uniform(0),
            uAlphaMap: new Uniform(planeTexture),
            uRepeat: new Uniform(planeTexture.repeat),
            uSpeed: new Uniform(0.01),
            uRadius: new Uniform(10),
            uFadeScale: new Uniform(0.5),
            uColor: new Uniform(new Color('#22bffd')),
            uBaseColor: new Uniform(new Color('#064057')),
            uWidth: new Uniform(15),
            uOpacity: new Uniform(1),
        },
        vertexShader: /*glsl*/`
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            void main() {
                vUv = uv;
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: /*glsl*/`
            // 圆环宽度
            uniform float uWidth;
            // 圆环扩散中心
            const vec3 center = vec3(0, 0, 0);
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            // 半径
            uniform float uRadius;
            // 渐变比例
            uniform float uFadeScale;
            // alpha贴图
            uniform sampler2D uAlphaMap;
            // 贴图重复次数
            uniform vec2 uRepeat;
            // 颜色
            uniform vec3 uColor;
            // 背景颜色
            uniform vec3 uBaseColor;
            // 透明度
            uniform float uOpacity;

            void main() {
                vec2 uv = vUv * uRepeat;
                float innerRadius = uRadius;
                float outerRadius = innerRadius + uWidth;

                // 计算当前像素点到中心的距离
                float d = distance(vWorldPosition, center);
                // 计算当前像素点是否在环内
                float isInRing = step(innerRadius, d) * step(d, outerRadius);

                // 计算渐变中心
                float fadeCenter = mix(innerRadius, outerRadius, uFadeScale);
                // 计算渐变范围
                float fadeRange = uWidth * 0.5;
                // 计算渐变值
                float fade = smoothstep(1.0, 0.0, abs(d - fadeCenter) / fadeRange) ;

                // 计算alpha值
                float alpha = texture2D(uAlphaMap, uv).b;

                // 计算影响值
                float affect = isInRing * alpha * fade * uOpacity;
                // 计算最终颜色
                vec3 diffues = mix(uBaseColor, uColor, affect);

                gl_FragColor = vec4(diffues, 1.0);
            }
        `
    });

    const plane = new Mesh(
        new PlaneGeometry(500, 500),
        planeMaterial
    );

    plane.onBeforeRender = () => {
        let curRadius = planeMaterial.uniforms.uRadius.value;
        planeMaterial.uniforms.uRadius.value = (curRadius + 1) % 250;
        planeMaterial.uniforms.uOpacity.value = 1 - (curRadius + 1) % 250 / 250;
    }
    plane.position.z = -2;
    scene.add(plane);


    resize(renderer, camera);
    const params = {
        baseColor: '#064057',
        color: '#22bffd',
    }
    const gui = initGUI();
    gui.addColor(params, 'baseColor').onChange((value) => {
        planeMaterial.uniforms.uBaseColor.value.set(value);
    });
    gui.addColor(params, 'color').onChange((value) => {
        planeMaterial.uniforms.uColor.value.set(value);
    });
    gui.add(planeMaterial.uniforms.uRadius, 'value').min(0).max(250).step(1).name('radius');
    gui.add(planeMaterial.uniforms.uFadeScale, 'value').min(0).max(1).step(0.01).name('fadeScale');
    gui.add(planeMaterial.uniforms.uWidth, 'value').min(0).max(150).step(1).name('width');
}

function createCanvas() {
    const R = 40;                          // 六边形外接圆半径
    const hexH = Math.sqrt(3) / 2 * R;
    const canvasHeight = hexH * 4;
    const canvasWidth = 3 * R;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';

    // document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    // 六边形绘制函数
    function drawHex(cx, cy) {
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
            const angle = Math.PI / 3 * i;
            const x = cx + R * Math.cos(angle);
            const y = cy + R * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // 平移偏移，使 hex 内容居中
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // 画三个 hex：左半 + 中间 + 右半
    drawHex(centerX, centerY);
    drawHex(centerX, centerY - 2 * hexH);
    drawHex(centerX, centerY + 2 * hexH);

    drawHex(centerX - R * 3 / 2, centerY - hexH);
    drawHex(centerX - R * 3 / 2, centerY + hexH);
    drawHex(centerX + R * 3 / 2, centerY - hexH);
    drawHex(centerX + R * 3 / 2, centerY + hexH);

    return canvas;
}