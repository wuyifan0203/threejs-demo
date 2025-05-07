/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-29 15:09:33
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-07 19:33:23
 * @FilePath: \threejs-demo\src\occt\useWorker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    MeshNormalMaterial,
    Mesh,
    BufferGeometry,
    Float32BufferAttribute
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
    gridPositions,
    TWO_PI,
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

    const list = {
        Box: {
            xSpan: 2,
            ySpan: 2,
            zSpan: 2
        },
        Sphere: {
            radius: 1
        },
        Cylinder: {
            radius: 1,
            height: 2,
            angle: TWO_PI
        },
        Cone: {
            radius1: 0.7,
            radius2: 1,
            height: 2,
            angle: TWO_PI
        },
        Tours: {
            outerRadius: 1,
            innerRadius: 0.7,
            startAngle: 0,
            endAngle: TWO_PI,
        },
    };

    const material = new MeshNormalMaterial();
    const meshList = [];

    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
        if (data?.init) {
            worker.postMessage({ list });
        } else {
            const geometry = new BufferGeometry();
            geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
            geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3));
            const mesh = new Mesh(geometry, material);
            scene.add(mesh);
            meshList.push(mesh);
            meshList.forEach((mesh, i) => {
                const pos = gridPositions(meshList.length, i, 4);
                mesh.position.copy(pos);
            })
        }
    }

    worker.onmessageerror = ({ data }) => {
        console.error('worker error: ', data);
    }


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(material, 'wireframe');

    Object.entries(list).forEach(([name, values]) => {
        const folder = gui.addFolder(name);
        Object.entries(values).forEach(([key, value]) => {
            const k = key.toLowerCase();
            let kf = null
            if (k.includes('angle')) {
                kf = folder.add(values, key, 0, TWO_PI, 0.1);
            } else {
                kf = folder.add(values, key, 0, 3, 0.01);
            };
            kf.onFinishChange((v) => {
                worker.postMessage({ list });
            })
        })

    })
}

