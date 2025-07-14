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
    planeTexture.repeat.set(10, 10);

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
    const hexW = 3 * R;                    // 真实 tile 宽度
    const hexH = Math.sqrt(3) * R;         // 真实 tile 高度
    const canvasSize = Math.max(hexW, hexH); // ✅ 正方形 canvas 尺寸

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;

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
    const offsetX = (canvas.width - hexW) / 2;
    const offsetY = (canvas.height - hexH) / 2;

    // 六边形中心 Y 位置 = hexH / 2 + offsetY
    const centerY = hexH / 2 + offsetY;

    // 画三个 hex：左半 + 中间 + 右半
    drawHex(offsetX + 0, centerY);
    drawHex(offsetX + R * 1.5, centerY + R - 6);
    drawHex(offsetX + R * 3.0, centerY);
    drawHex(offsetX + R * 1.5, centerY - R + 6);

    return canvas;
}