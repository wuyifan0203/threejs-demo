/*
 * @Date: 2023-09-18 20:54:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-20 01:43:15
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
    console.log({ modelMatrix });


    // 立方体左下角坐标
    const point = new Vector3(-2, -2, -2);

    // 转换到实际坐标

    // 模型坐标转世界坐标
    point.applyMatrix4(modelMatrix); 

    console.log('世界坐标:',point);

    // 世界坐标转相机坐标

    const point2 = point.clone().applyMatrix4(viewMatrix);
    console.log('相机坐标:',point2);

    // 相机坐标转投影坐标
    const point3 = point2.clone().applyMatrix4(projectionMatrix);
    console.log('投影坐标:',point3);


 

    // 投影坐标转屏幕坐标
    const x = 1000- (500 - point3.x * 500) ;
    const y = 800 - (1- point3.y) * 400;

    console.log('屏幕坐标:',x,y);




}
