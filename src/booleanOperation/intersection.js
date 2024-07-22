/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-26 13:06:02
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 11:23:24
 * @FilePath: /threejs-demo/src/booleanOperation/intersection.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector3,
    MeshStandardMaterial,
    BoxGeometry,
    SphereGeometry,
    TorusKnotGeometry,
    BufferGeometry,
    MeshBasicMaterial
} from "../lib/three/three.module.js";
import {
    initAmbientLight,
    initCoordinates,
    initCustomGrid,
    initDirectionLight,
    initGUI,
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
    initScene
} from "../lib/tools/common.js";
import {
    INTERSECTION,
    SUBTRACTION,
    ADDITION,
    Brush,
    Evaluator,
    HOLLOW_INTERSECTION,
    HOLLOW_SUBTRACTION
} from '../lib/other/three-bvh-csg.js';
import { TransformControls } from '../lib/three/TransformControls.js';

window.onload = function () {
    init()
}

function init() {
    const scene = initScene();
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(20, 20, 20));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(20, -20, 20);
    scene.add(light);
    initCustomGrid(scene, 20, 20);
    const coord = initCoordinates(5);
    // scene.add(coord);
    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls);

    const params = { transparent: true, opacity: 0.5 };

    const box1Mesh = new Mesh(new BoxGeometry(3, 3, 3, 10, 10, 10), new MeshStandardMaterial({ color: 0x999999, ...params }));
    const box2Mesh = new Mesh(new BoxGeometry(3, 3, 3, 10, 10, 10), new MeshStandardMaterial({ color: 0xcccccc, ...params }));
    box2Mesh.position.set(2, 2, 2);

    const sphereMesh = new Mesh(new SphereGeometry(3, 32, 32), new MeshStandardMaterial({ color: 0xffff00, ...params }));
    sphereMesh.position.set(0, 0, 0);

    const tourKnotMesh = new Mesh(new TorusKnotGeometry(3, 1, 128, 32), new MeshStandardMaterial({ color: 0xff0000, ...params }));
    tourKnotMesh.position.set(0, 0, 0);

    transformControls.addEventListener('mouseDown', () => {
        orbitControls.enabled = false;
    });

    transformControls.addEventListener('mouseUp', () => {
        orbitControls.enabled = true;
    })



    const meshes = [box1Mesh, box2Mesh, sphereMesh, tourKnotMesh];

    const resultMeshMaterial = new MeshStandardMaterial({
        roughness: 0.1,
        metalness: 0,
        color: '#049ef4',
        // polygonOffset: true,
        // polygonOffsetUnits: 2,
        // polygonOffsetFactor: -100,
    })
    const resultMesh = new Mesh(new BufferGeometry(), resultMeshMaterial);

    const wireframe = new Mesh(new BufferGeometry(), new MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        polygonOffset: true,
        polygonOffsetUnits: 1,
        polygonOffsetFactor: 1,
        depthTest: false,
        side: 2
    }));
    wireframe.visible = false;

    scene.add(resultMesh);
    scene.add(wireframe);

    const controls = {
        operation: SUBTRACTION,
        target: sphereMesh,
        compare: tourKnotMesh
    }


    const gui = initGUI();
    gui.add(controls, 'operation', {
        INTERSECTION,
        SUBTRACTION,
        ADDITION,
        HOLLOW_INTERSECTION,
        HOLLOW_SUBTRACTION
    }).onChange(updateCSG);

    gui.add(controls, 'target', {
        box1Mesh, box2Mesh, sphereMesh, tourKnotMesh
    }).onChange(updateCSG);

    gui.add(controls, 'compare', {
        box1Mesh, box2Mesh, sphereMesh, tourKnotMesh
    }).onChange(updateCSG);

    gui.add(wireframe, 'visible').name('wireframe');

    const showResultMesh = () => {
        controls.target.visible = !resultMesh.visible;
        controls.compare.visible = !resultMesh.visible;
    }
    gui.add(resultMesh, 'visible').name('Show ResultMesh').onChange(showResultMesh);

    let evaluator = new Evaluator();
    evaluator.attributes = ['position', 'normal', 'uv'];
    evaluator.useGroups = false;

    function updateCSG() {
        meshes.forEach(mesh => scene.remove(mesh));

        controls.target.updateMatrixWorld(true);
        controls.compare.updateMatrixWorld(true);

        scene.add(controls.target);
        scene.add(controls.compare);

        transformControls.attach(controls.compare);

        const targetGeometry = controls.target.geometry.clone();
        const compareGeometry = controls.compare.geometry.clone();
        targetGeometry.applyMatrix4(controls.target.matrixWorld);
        compareGeometry.applyMatrix4(controls.compare.matrixWorld);
        const targetBrush = new Brush(targetGeometry);
        const compareBrush = new Brush(compareGeometry);
        evaluator.evaluate(targetBrush, compareBrush, controls.operation, resultMesh);
        resultMesh.material = resultMeshMaterial;

        if (wireframe.visible) {
            wireframe.geometry.dispose();
            wireframe.geometry = resultMesh.geometry.clone();
        }

        targetBrush.disposeCacheData();
        compareBrush.disposeCacheData();
    }

    transformControls.addEventListener('change', updateCSG);
    (function render() {
        orbitControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    })()

    updateCSG();

    showResultMesh()
}