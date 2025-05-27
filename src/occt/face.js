/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-05-26 14:07:53
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-27 17:03:48
 * @FilePath: \threejs-demo\src\occt\face.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    MeshNormalMaterial,
    BufferGeometry,
    Float32BufferAttribute,
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
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';

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
    const mesh = new Mesh(new BufferGeometry(), new MeshNormalMaterial());
    scene.add(mesh);
    const worker = new Worker(new URL("./face.worker.js", import.meta.url), { type: "module", });
    worker.onmessage = ({ data }) => {
        const { type, payload } = data;
        if (type === 'init') {
            worker.postMessage({ type: 'makeBox', payload: { width: 3, height: 3, depth: 3 } });
        } else if (type === 'generate') {
            const { faceList } = payload;
            const buffer = OpenCascadeHelper.convertBufferAttribute(faceList);
            console.log('buffer: ', buffer);
            mesh.geometry.dispose();
            const geometry = new BufferGeometry();
            geometry.setAttribute('position', new Float32BufferAttribute(buffer.position, 3));
            geometry.setAttribute('normal', new Float32BufferAttribute(buffer.normal, 3));
            geometry.setAttribute('uv', new Float32BufferAttribute(buffer.uvs, 2));
            geometry.setIndex(buffer.indices);
            mesh.geometry = geometry;
        }
    }


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(mesh.material, 'wireframe');
}

