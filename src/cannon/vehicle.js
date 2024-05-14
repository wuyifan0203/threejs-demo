/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-25 17:31:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-05-14 17:51:55
 * @FilePath: /threejs-demo/src/cannon/vehicle.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Clock,
    Vector3,
    TorusGeometry,
    CylinderGeometry,
    MeshStandardMaterial,
    BoxGeometry,
    MeshBasicMaterial,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initCoordinates
} from '../lib/tools/index.js';
import {
    World,
    Body,
    Material,
    ContactMaterial,
    NaiveBroadphase,
    Cylinder,
    Vec3,
    Box as BoxShape,
} from '../lib/other/physijs/cannon.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js';

window.onload = () => {
    init();
};


function init() {
    // 创建渲染器、相机、场景
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, 20, 20));
    const scene = initScene();

    // 坐标轴
    scene.add(initCoordinates(5));

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const world = new World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const vehicleShape = new BoxShape(new Vec3(2, 1, 1));
    const vehicleBody = new Body({ mass: 1, position: new Vec3(0, 0, 0) });
    vehicleBody.addShape(vehicleShape);

    world.addBody(vehicleBody);

    const { update } = CannonDebugger(scene, world)

    const frame = 1 / 45;
    const clock = new Clock();
    function render() {
        world.step(frame, clock.getDelta());
        orbitControls.update();
        renderer.render(scene, camera);
        update();
    }


    renderer.setAnimationLoop(render)

}

function createVehicle(scene, world) {
    const size = new Vector3(2, 0.5, 1)
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const material = new MeshStandardMaterial({ color: 0x00ff00 });
    const mesh = new Mesh(geometry, material);

    scene.add(mesh);

    const body = new Body({ mass: 5 });
    body.addShape(new BoxShape(new Vec3().copy(size).scale(0.5)));

}