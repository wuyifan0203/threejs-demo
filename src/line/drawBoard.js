/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-07-29 11:27:10
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-07-29 17:28:28
 * @FilePath: \threejs-demo\src\line\drawBoard.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    MeshNormalMaterial,
    Vector2,
    Vector3,
    Plane,
    Line,
    BufferGeometry,
    LineBasicMaterial
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    const mesh = new Mesh(new BoxGeometry(3, 3, 3), new MeshNormalMaterial());
    scene.add(mesh);

    const cameraDir = new Vector3();
    const renderSize = new Vector2(window.innerWidth, window.innerHeight);
    const centerPoint = new Vector3();

    const plane = new Plane();
   const tmpLine = new Line(new BufferGeometry(),new LineBasicMaterial({color:'#000000'}));
    scene.add(tmpLine);

    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    const tmpPoints = [];

    function startDraw() {
        controls.enabled = false;
        updateCameraInfo();
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
    }

    function onMouseDown(e) {
        tmpPoints.length = 0;
        onMouseMove(e);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
    }

    function onMouseMove(e) {
        const mouse = new Vector2(e.clientX, e.clientY);
        const res = project(mouse);
        tmpPoints.push(res);
        updateTmpLine();
    }

    function project(screenPoint) {
        const v = new Vector3(
            (screenPoint.x / renderSize.x) * 2 - 1,
            -(screenPoint.y / renderSize.y) * 2 + 1,
            0
        );
        v.unproject(camera);
        const res = plane.projectPoint(v, new Vector3())
        return res;
    }

    function onMouseUp(e) {
        onMouseMove(e);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        addLine();
    }

    function endDraw() {
        controls.enabled = true;
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
    }

    function updateCameraInfo() {
        cameraDir.copy(camera.position).sub(controls.target).normalize();
        centerPoint.copy(cameraDir).multiplyScalar(camera.position.distanceTo(controls.target) / 2);
        plane.setFromNormalAndCoplanarPoint(cameraDir, centerPoint);
    }

 
    function updateTmpLine() {
        tmpLine.geometry.dispose();
        tmpLine.geometry = new BufferGeometry().setFromPoints(tmpPoints);
    }

    function addLine() {
        const line = new Line(new BufferGeometry(),new LineBasicMaterial({color:'#000000'}));
        line.geometry.setFromPoints(tmpPoints);
        scene.add(line);
    }

    resize(renderer, camera, (w, h) => renderSize.set(w, h));
    const parans = {
        draw: startDraw,
        exit: endDraw
    }
    const gui = initGUI();
    gui.add(parans, 'draw');
    gui.add(parans, 'exit');
}