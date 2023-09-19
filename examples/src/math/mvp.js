/*
 * @Date: 2023-09-18 20:54:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-19 21:00:40
 * @FilePath: /threejs-demo/examples/src/math/mvp.js
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
    PointLight,
    DirectionalLight,
    Matrix4
} from '../lib/three/three.module.js';

import {
    initRenderer,
    initOrthographicCamera,
    resize,
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
    const renderer = initRenderer();
    renderer.setSize(1000, 800)
    const camera = new OrthographicCamera(-15, 15, 15, -15, 1, 100);
    camera.position.set(0, -10, 10)
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    const scene = new Scene();

    scene.add(new AmbientLight());
    const light = new DirectionalLight();
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

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera)
    })

    const projectionMatrix = new Matrix4().makeOrthographic(-15, 15, -15, 15, 1, 100);

    console.log({ projectionMatrix });


    const viewMatrix = new Matrix4().lookAt(new Vector3(0, -10, 10), new Vector3(0, 0, 0), new Vector3(0, 0, 1));

    console.log({ viewMatrix });

    const modelMatrix = new Matrix4().makeTranslation(new Vector3(0, 1, 2));
    console.log({ modelMatrix }, mesh.matrix);

    const mvpMatrix = new Matrix4().multiplyMatrices(projectionMatrix, viewMatrix).multiply(modelMatrix);
    console.log({ mvpMatrix });

    // 立方体左下角坐标
    const point = new Vector3(-2, -2, -2);

    // 转换到实际坐标

    point.applyMatrix4(modelMatrix.multiply(viewMatrix.multiply(projectionMatrix)));

    console.log({ point });

    const x = 1000 - (1-point.x) * 500;
    const y = -400 * point.y + 400;

    console.log({ x, y });


}
