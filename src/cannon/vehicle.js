/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-25 17:31:30
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-09-04 18:18:47
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
    Vector4,
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
    Cylinder,
    SAPBroadphase,
    RigidVehicle,
    Vec3,
    Quaternion,
    ContactMaterial,
    Box as BoxShape,
} from '../lib/other/physijs/cannon-es.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

const halfPI = Math.PI / 2;

window.onload = () => {
    init();
};


function init() {
    // 创建渲染器、相机、场景
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(-2000, 2000, 0));
    const scene = initScene();

    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(20, 20, 20);
    scene.add(light);

    // 坐标轴
    scene.add(initCoordinates(5));

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const world = new World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new SAPBroadphase(world);
    world.defaultContactMaterial.friction = 0.2;

    createGround(scene, world);
    const vehicle = createVehicle(scene, world);

    const cannonDebugger = CannonDebugger(scene, world, { color: 0xffff00 });

    const frame = 1 / 45;
    const clock = new Clock();
    function render() {
        world.step(frame, clock.getDelta());
        orbitControls.update();
        renderer.render(scene, camera);
        vehicle.update();
        cannonDebugger.update();
        requestAnimationFrame(render);
    };
    render();

    document.addEventListener('keydown', (event) => {
        console.log(event.key, 'keydown');
        switch (event.key.toUpperCase()) {
            case 'W':
            case 'ARROWUP':
                vehicle.control('up', true);
                break;
            case 'S':
            case 'ARROWDOWN':
                vehicle.control('down', true);
                break;
            case 'A':
            case 'AARROWLEFT':
                vehicle.control('left', true);
                break;
            case 'D':
            case 'ARROWRIGHT':
                vehicle.control('right', true);
                break;
        }
    })

    document.addEventListener('keyup', (event) => {
        console.log(event.key, 'keyup');
        switch (event.key.toUpperCase()) {
            case 'W':
            case 'ARROWUP':
                vehicle.control('up', false);
                break;
            case 'S':
            case 'ARROWDOWN':
                vehicle.control('down', false);
                break;
            case 'A':
            case 'AARROWLEFT':
                vehicle.control('left', false);
                break;
            case 'D':
            case 'ARROWRIGHT':
                vehicle.control('right', false);
                break;
        }
    })
}

function createGround(scene, world) {
    const size = new Vector3(1000, 0.5, 1000);
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: 0xd8d8d8 }));
    mesh.matrixAutoUpdate = false;
    mesh.matrixWorldAutoUpdate = false;
    mesh.receiveShadow = true;
    mesh.updateMatrix();
    mesh.updateMatrixWorld(true);
    scene.add(mesh);

    const shape = new BoxShape(new Vec3().copy(size).scale(0.5));
    const body = new Body({ mass: 0, shape, material: new Material('Ground') });
    body.position.copy(mesh.position);

    world.addBody(body);
}

function createVehicle(scene, world) {
    const vehicleSize = new Vector3(4, 2, 2);
    const wheelMass = 1;
    const wheelRadius = new Vector3(0.5, 0.5 / 2, 16); // 半径，半轴长，段数
    // 添加小车
    /// 添加小车Mesh

    const halfSize = vehicleSize.clone().multiplyScalar(0.5);
    const vehicleGeometry = new BoxGeometry(vehicleSize.x, vehicleSize.y, vehicleSize.z);

    const vehicleMeshMaterial = new MeshStandardMaterial({ color: 0x00ff00 });

    const vehicleMesh = new Mesh(vehicleGeometry, vehicleMeshMaterial);
    vehicleMesh.castShadow = true;
    vehicleMesh.receiveShadow = true;
    vehicleMesh.position.set(0, 5, 0);

    scene.add(vehicleMesh);

    // 添加小车Body
    const vehicleBody = new Body({ mass: 5 });
    const vehicleShape = new BoxShape(new Vec3().copy(halfSize));
    vehicleBody.addShape(vehicleShape);
    vehicleBody.position.copy(vehicleMesh.position);
    const vehicle = new RigidVehicle({ chassisBody: vehicleBody, });

    // 添加车轮
    const wheelGeometry = new CylinderGeometry(wheelRadius.x, wheelRadius.x, wheelRadius.y, wheelRadius.z);
    wheelGeometry.rotateX(halfPI);
    const wheelMeshMaterial = new MeshStandardMaterial({ color: 0xff0000 });

    const wheelShape = new Cylinder(wheelRadius.x, wheelRadius.x, wheelRadius.y, wheelRadius.z);
    const wheelMaterial = new Material('wheel')
    const down = new Vec3(0, -1, 0);

    const wheelMeshes = [];
    const wheelBodies = [];

    const rotateX = new Vec3(1, 0, 0);

    const wheelDistanceToCarX = halfSize.x;
    const wheelDistanceToCarZ = halfSize.z + wheelRadius.y;

    const wheelsPosition = [
        new Vec3(wheelDistanceToCarX, -halfSize.y, -wheelDistanceToCarZ), // 左前轮
        new Vec3(wheelDistanceToCarX, -halfSize.y, wheelDistanceToCarZ), // 右前轮
        new Vec3(-wheelDistanceToCarX, -halfSize.y, -wheelDistanceToCarZ), // 左后轮
        new Vec3(-wheelDistanceToCarX, -halfSize.y, wheelDistanceToCarZ) // 右后轮
    ];

    console.log(wheelsPosition);

    const colors = [0x00ff00, 0x0000ff, 0xff0000, 0xffffff];

    console.log(vehicle.wheelAxes);

    wheelsPosition.forEach((position, i) => {
        const mesh = new Mesh(wheelGeometry, wheelMeshMaterial.clone());
        mesh.material.color.setHex(colors[i]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.copy(position);
        wheelMeshes.push(mesh);
        scene.add(mesh);

        const body = new Body({ mass: wheelMass, material: wheelMaterial });
        body.addShape(wheelShape, new Vec3(0, 0, 0), new Quaternion().setFromAxisAngle(rotateX, halfPI));
        wheelBodies.push(body);


        vehicle.addWheel({
            body,
            position,
            direction: down,
            axis: new Vec3(0, 0, i % 2 ? -1 : 1),
        })
    })

    const wheel_ground = new ContactMaterial(wheelMaterial, groundMaterial, {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
    })
    world.addContactMaterial(wheel_ground)

    vehicle.addToWorld(world);

    const maxForce = 100;
    const maxSteerVal = Math.PI / 8;

    return {
        update() {
            vehicleMesh.position.copy(vehicleBody.position);
            vehicleMesh.quaternion.copy(vehicleBody.quaternion);
            wheelMeshes.forEach((mesh, i) => {
                mesh.position.copy(wheelBodies[i].position);
                mesh.quaternion.copy(wheelBodies[i].quaternion);
            })
        },
        control(key, state) {
            if (state) {
                switch (key) {
                    case 'up':
                        vehicle.applyWheelForce(maxForce, 2);
                        vehicle.applyWheelForce(-maxForce, 3);
                        break;
                    case 'down':
                        vehicle.setWheelForce(-maxForce / 2, 2)
                        vehicle.setWheelForce(maxForce / 2, 3)
                        break;
                    case 'left':
                        vehicle.setSteeringValue(maxSteerVal, 0)
                        vehicle.setSteeringValue(maxSteerVal, 1)
                        break;
                    case 'right':
                        vehicle.setSteeringValue(-maxSteerVal, 0)
                        vehicle.setSteeringValue(-maxSteerVal, 1)
                        break;
                }
            } else {
                switch (key) {
                    case 'up':
                        vehicle.setWheelForce(0, 2)
                        vehicle.setWheelForce(0, 3)
                        break;
                    case 'down':
                        vehicle.setWheelForce(0, 2)
                        vehicle.setWheelForce(0, 3)
                        break;
                    case 'left':
                        vehicle.setSteeringValue(0, 0)
                        vehicle.setSteeringValue(0, 1)
                        break;
                    case 'right':
                        vehicle.setSteeringValue(0, 0)
                        vehicle.setSteeringValue(0, 1)
                        break;
                }
            }
        }
    }
}