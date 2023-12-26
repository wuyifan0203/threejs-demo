/*
 * @Date: 2023-09-18 20:54:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-26 16:29:56
 * @FilePath: /threejs-demo/src/math/mvpInverse.js
 */
/* eslint-disable no-unused-vars */

import {
    Scene,
    Mesh,
    Vector3,
    OrthographicCamera,
    GridHelper,
    BoxGeometry,
    MeshLambertMaterial,
    AmbientLight,
    Matrix4
} from '../lib/three/three.module.js';

import {
    initRenderer, initOrbitControls, initGUI, initDirectionLight
} from '../lib/tools/index.js';


window.onload = function () {
    init();
};

function init() {
    const dom = document.querySelector('#webgl-output');
    if (dom) {
        dom.style.height = '800px';
        dom.style.width = '1000px';
    }

    const infoDom = document.querySelector('#info');
    const renderer = initRenderer();
    renderer.setSize(1000, 800)
    const camera = new OrthographicCamera(-15, 15, 15, -15, 1, 100);
    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    camera.updateProjectionMatrix();

    const scene = initScene();

    const control = initOrbitControls(camera, renderer.domElement);

    control.enableRotate = false;

    control.addEventListener('change', () => {
        renderer.render(scene, camera)
    })

    const gui = initGUI();


    scene.add(new AmbientLight());
    const light = initDirectionLight();
    light.position.set(0, -10, 5);
    scene.add(light)


    const grid = new GridHelper(30, 30);
    grid.rotateX(Math.PI / 2);
    scene.add(grid)

    const box = new BoxGeometry(4, 4, 4)
    const material = new MeshLambertMaterial({ color: '#00a2ec' })
    const mesh = new Mesh(box, material);

    mesh.position.set(0, 1, 2);
    scene.add(mesh);

    renderer.setClearColor(0xffffff);

    renderer.domElement.addEventListener('click', (e) => {

        const { offsetX, offsetY } = e

        // point * M * V * P * NDC  = result
        // ==>
        // point = result * NDCinvert * PInvert * VInvert * MInvert
        // 原始鼠标坐标
        const points = new Vector3(offsetX, offsetY, 0);
        const ndcMatrix = createNDCMatrix(1000, 800).invert();
        // 鼠标坐标转化为webgl坐标系
        points.applyMatrix4(ndcMatrix);
        const webglCoord = points.clone();
        // webgl坐标系转化为相机坐标
        points.applyMatrix4(camera.projectionMatrixInverse);
        const cameraCoord = points.clone();
        // 相机坐标系转化为世界坐标系
        points.applyMatrix4(camera.matrixWorld);
        const worldCoord = points.clone();



        infoDom.innerHTML = tip('鼠标坐标：', [offsetX, offsetY]) +
            tip('canvas 坐标系:', [webglCoord.x.toFixed(3), webglCoord.y.toFixed(3), webglCoord.z]) +
            tip('相机坐标系:', [cameraCoord.x.toFixed(3), cameraCoord.y.toFixed(3), cameraCoord.z.toFixed(3)]) +
            tip('世界坐标系:', [worldCoord.x.toFixed(3), worldCoord.y.toFixed(3), worldCoord.z.toFixed(3)]);


    })

    renderer.render(scene, camera)

    function tip(label, message) {
        return `<div>
            <span>
                ${label}
            </span>
            <span>
                ${message}
            </span>
        </div>`;

    }

    const o = { normal: 1 }

    const normalMap = {
        1: new Vector3(0, 0, 10),
        2: new Vector3(0, 10, 0),
        3: new Vector3(10, 0, 0)
    }

    gui.add(o, 'normal', {
        normalZ: 1,
        normalX: 2,
        normalY: 3
    }).onChange((e) => {
        camera.position.copy(normalMap[e]);
        camera.updateProjectionMatrix();
        control.update();
        renderer.render(scene, camera)
    })



}

function createNDCMatrix(width, height) {
    const W = width / 2;
    const H = height / 2;
    return new Matrix4().set(
        W, 0, 0, W,
        0, -H, 0, H,
        0, 0, 1, 0,
        0, 0, 0, 1
    )
}