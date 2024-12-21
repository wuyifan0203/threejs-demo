/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-12-21 17:46:50
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-21 18:24:26
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
    Path
} from "three";
import {
    initRenderer,
    initGUI,
    initScene,
    resize,
    initPerspectiveCamera,
    initOrbitControls,
    vec2ToVec3,
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

    const lineTube = new Mesh(new TubeGeometry(curve, 200, 0.5), new MeshNormalMaterial());
    lineTube.geometry.computeBoundingBox();
    const center = new Vector3();
    lineTube.geometry.boundingBox.getCenter(center);
    lineTube.geometry.translate(-center.x, -center.y, -center.z);
    lineTube.scale.set(0.3, 0.3, 0.3);
    scene.add(lineTube);

    const material = new ShaderMaterial({});

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, scene, [camera]);
}