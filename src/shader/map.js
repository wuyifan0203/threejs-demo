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
    BoxGeometry,
    MeshNormalMaterial,
    ExtrudeGeometry,
    Shape,
    Vector2,
    Vector3,
    TubeGeometry,
    CatmullRomCurve3,
    CanvasTexture,
    RepeatWrapping,
    MeshBasicMaterial
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
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
    initCustomGrid(scene);

    const dataPath = `../../public/data`;
    const conuntryData = await loadJSON(`${dataPath}/country.json`);
    const provinceData = await loadJSON(`${dataPath}/province.json`);

    const countryGeo = convertGeoJSON(conuntryData);
    console.log('countryGeo: ', conuntryData);
    const provinceGeo = convertGeoJSON(provinceData);
    console.log('provinceGeo: ', provinceGeo);
    console.log('provinceData: ', provinceData);

    const controls = initOrbitControls(camera, renderer.domElement);

    const material = new MeshNormalMaterial();
    const offset = new Vector2().copy(provinceGeo.center).negate();

    provinceData.features.forEach((province) => {
        console.log(6);
        province.geometry.shapes.forEach((points, i) => {
            transformShape({ shape: points }, 'translate', offset);
            transformShape({ shape: points }, 'scale', new Vector2(1, -1));

            const geometry = new ExtrudeGeometry(new Shape(points));
            const mesh = new Mesh(geometry, material);
            mesh.userData = province.properties;
            scene.add(mesh);
        })
    });

    const countryShape = conuntryData.features[0].geometry.shapes[0];
    transformShape({ shape: countryShape }, 'translate', countryGeo.center.negate());
    transformShape({ shape: countryShape }, 'scale', new Vector2(1, -1));
    const geometry = new TubeGeometry(new CatmullRomCurve3(vec2ToVec3(countryShape), true), 2000, 0.1);
    const countryMesh = new Mesh(geometry, material);
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
    planeTexture.repeat.set(50, 50);

    const plane = new Mesh(
        new BoxGeometry(100, 100),
        new MeshBasicMaterial({ map: planeTexture })
    );
    plane.position.z = 10;
    scene.add(plane);



    resize(renderer, camera);
    const gui = initGUI();
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

    document.body.appendChild(canvas);

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