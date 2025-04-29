/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-29 15:09:33
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-04-29 16:38:04
 * @FilePath: \threejs-demo\src\occt\base.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector3,
    MeshNormalMaterial,
    Mesh
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
import { initOpenCascade } from '../lib/other/opencascade/index.js'
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';

let occ = null;
window.onload = async () => {
    try {
        occ = await initOpenCascade();
        OpenCascadeHelper.setOpenCascade(occ);
        init();
    } catch (error) {
        console.error('初始化失败:', error);
    }
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

    const classMap = {
        Box,
        Sphere
    };

    const list = [
        {
            type: 'Box',
            parameter: {
                x: 2,
                y: 2,
                z: 2
            }
        },
        {
            type: 'Sphere',
            parameter: {
                radius: 1
            }
        }
    ];

    const material = new MeshNormalMaterial();

    const meshList = [];
    list.forEach(({ type, parameter }, i) => {
        const shape = new classMap[type](parameter);
        const geometry = OpenCascadeHelper.convertBufferGeometry(shape);
        const mesh = new Mesh(geometry, material);
        meshList.push(mesh);
        mesh.position.set(i * 5, i * 5, 0);
        scene.add(mesh);
    })


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(material, 'wireframe')
}

function Box({ x, y, z }) {
    const box = new occ.BRepPrimAPI_MakeBox_2(x, y, z)
    const shape = box.Shape();
    return transform(new Vector3(-x / 2, -y / 2, -z / 2), shape);
}

function Sphere({ radius }) {
    return new occ.BRepPrimAPI_MakeSphere_1(radius).Shape();
}

function transform(offset, occShape) {
    const transformation = new occ.gp_Trsf_1();
    transformation.SetTranslation_1(new occ.gp_Vec_4(offset.x, offset.y, offset.z));
    const translation = new occ.TopLoc_Location_2(transformation);
    return occShape.Moved(translation, true);
}