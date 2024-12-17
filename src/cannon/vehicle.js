/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-25 17:31:30
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-09-10 15:31:10
 * @FilePath: /threejs-demo/src/cannon/vehicle.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Clock,
    Vector3,
    Matrix4,
    CylinderGeometry,
    MeshStandardMaterial,
    BoxGeometry,
    Quaternion as TreQuaternion,
    SphereGeometry,
    Group,
    CameraHelper
} from 'three';
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
    Sphere
} from '../lib/other/physijs/cannon-es.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js'

const halfPI = Math.PI / 2;
const tmp4 = new Matrix4()

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
    light.position.set(300, 300, 300);
    light.shadow.camera.top = 500;
    light.shadow.camera.bottom = -500;
    light.shadow.camera.left = -800;
    light.shadow.camera.right = 800;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 1000;
    light.shadow.mapSize.height = 10240;
    light.shadow.mapSize.width = 10240;
    light.shadow.bias = -0.0005;
    scene.add(light);

    // 坐标轴
    scene.add(initCoordinates(5));

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const world = new World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new SAPBroadphase(world);
    world.defaultContactMaterial.friction = 0.2;

    const ground = createGround(scene, world);
    const vehicle = createVehicle(scene, world);

    const vehicle2 = createVehicle2(scene, world);

    const wheel_ground = new ContactMaterial(vehicle.wheelMaterial, ground.material, {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
    })
    const wheel2_ground = new ContactMaterial(vehicle2.wheelMaterial, ground.material, {
        friction: 0.5,
        restitution: 0.1,
        contactEquationStiffness: 1000,
    })
    world.addContactMaterial(wheel_ground)
    world.addContactMaterial(wheel2_ground)

    const cannonDebugger = CannonDebugger(scene, world, { color: 0xffff00 });

    const frame = 1 / 45;
    const clock = new Clock();
    function render() {
        world.step(frame, clock.getDelta());
        orbitControls.update();
        renderer.render(scene, camera);
        vehicle.update();
        vehicle2.update();
        cannonDebugger.update();
        requestAnimationFrame(render);
    };
    render();

    document.addEventListener('keydown', (event) => {
        console.log(event.key, 'keydown');
        switch (event.key.toUpperCase()) {
            case 'W':
                vehicle.control('up', true);
                break;
            case 'S':
                vehicle.control('down', true);
                break;
            case 'A':
                vehicle.control('left', true);
                break;
            case 'D':
                vehicle.control('right', true);
                break;
            case 'R':
                vehicle.reset();
                break;
            case 'ARROWUP':
                vehicle2.control('up', true);
                break;
            case 'ARROWDOWN':
                vehicle2.control('down', true);
                break;
            case 'ARROWLEFT':
                vehicle2.control('left', true);
                break;
            case 'ARROWRIGHT':
                vehicle2.control('right', true);
                break;
        }
    })

    document.addEventListener('keyup', (event) => {
        switch (event.key.toUpperCase()) {
            case 'W':
                vehicle.control('up', false);
                break;
            case 'S':
                vehicle.control('down', false);
                break;
            case 'A':
                vehicle.control('left', false);
                break;
            case 'D':
                vehicle.control('right', false);
                break;
            case 'ARROWUP':
                vehicle2.control('up', false);
                break;
            case 'ARROWDOWN':
                vehicle2.control('down', false);
                break;
            case 'ARROWLEFT':
                vehicle2.control('left', false);
                break;
            case 'ARROWRIGHT':
                vehicle2.control('right', false);
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
    return {
        material: body.material,
    }
}

function createVehicle(scene, world) {
    const vehicleSize = new Vector3(4, 1, 2);
    const wheelMass = 1;
    const wheelRadius = new Vector3(0.5, 0.5 / 2, 16); // 半径，半轴长，段数

    const centerOfMassOffset = new Vector3(0, -1, 0);
    // 添加小车
    /// 添加小车Mesh

    const halfSize = vehicleSize.clone().multiplyScalar(0.5);
    const vehicleGeometry = new BoxGeometry(vehicleSize.x, vehicleSize.y, vehicleSize.z);
    vehicleGeometry.translate(centerOfMassOffset.x, centerOfMassOffset.y, centerOfMassOffset.z);

    const vehicleMeshMaterial = new MeshStandardMaterial({ color: 0x00ff00 });

    const vehicleMesh = new Mesh(vehicleGeometry, vehicleMeshMaterial);
    vehicleMesh.castShadow = true;
    vehicleMesh.receiveShadow = true;
    vehicleMesh.position.set(0, 5, 0);

    scene.add(vehicleMesh);

    // 添加小车Body
    const vehicleBody = new Body({ mass: 2 });
    const vehicleShape = new BoxShape(new Vec3().copy(halfSize));
    vehicleBody.addShape(vehicleShape, centerOfMassOffset);
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

    const colors = [0x00ff00, 0x0000ff, 0xff0000, 0xffffff];

    wheelsPosition.forEach((position, i) => {
        const mesh = new Mesh(wheelGeometry, wheelMeshMaterial.clone());
        mesh.material.color.setHex(colors[i]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        wheelMeshes.push(mesh);
        scene.add(mesh);

        const body = new Body({ mass: wheelMass, material: wheelMaterial });
        body.addShape(wheelShape, new Vec3(0, 0, 0), new Quaternion().setFromAxisAngle(rotateX, halfPI));
        body.angularDamping = 0.4
        wheelBodies.push(body);

        vehicle.addWheel({
            body,
            position: position.vadd(centerOfMassOffset),
            direction: down,
            axis: new Vec3(0, 0, i % 2 ? -1 : 1),
        })
    })

    vehicle.addToWorld(world);

    const maxForce = 50;
    const maxSteerVal = Math.PI / 8;

    return {
        wheelMaterial,
        position: vehicleBody.position,
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
                        vehicle.applyWheelForce(-maxForce, 2);
                        vehicle.applyWheelForce(maxForce, 3);
                        break;
                    case 'down':
                        vehicle.setWheelForce(maxForce / 2, 2)
                        vehicle.setWheelForce(-maxForce / 2, 3)
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
                    case 'down':
                        vehicle.setWheelForce(0, 2)
                        vehicle.setWheelForce(0, 3)
                        break;
                    case 'left':
                    case 'right':
                        vehicle.setSteeringValue(0, 0)
                        vehicle.setSteeringValue(0, 1)
                        break;
                }
            }
        },
        reset() {
            const currentPos = vehicle.chassisBody.position.clone();
            currentPos.y = 10;


            const axisX = new Vector3(1, 0, 0);
            const axisZ = new Vector3(0, 0, 1);
            const quaternion = new TreQuaternion().copy(vehicle.chassisBody.quaternion).invert();
            axisX.applyQuaternion(quaternion).normalize();
            axisZ.applyQuaternion(quaternion).normalize();;


            // 4. 计算新的四元数，使车辆的Y轴正方向朝上
            const upDirection = new Vec3(0, 1, 0);  // 世界坐标系中的Y轴正方向
            const newQuaternion = new Quaternion();
            newQuaternion.setFromVectors(new Vec3().copy(axisZ), upDirection);

            // 5. 将车辆的位置和新的旋转应用到车体上
            vehicle.chassisBody.position.copy(currentPos);
            vehicle.chassisBody.quaternion.copy(newQuaternion);

            vehicle.wheelBodies.forEach(wheelBody => {
                wheelBody.quaternion.copy(newQuaternion);
            });

            // 7. 重置车辆的速度和角速度（可选，根据需要）
            vehicle.chassisBody.velocity.set(0, 0, 0);
            vehicle.chassisBody.angularVelocity.set(0, 0, 0);
        }
    }
}

function createVehicle2(scene, world) {
    const size = new Vector3(5, 0.5, 2);
    const wheelRadius = 0.5;
    // Build the car chassis
    const halfSize = size.clone().multiplyScalar(0.5);
    const chassisShape = new BoxShape(halfSize)
    const chassisBody = new Body({ mass: 1 })
    chassisBody.position.set(0, 10, 10)
    const centerOfMassAdjust = new Vec3(0, -1, 0)
    chassisBody.addShape(chassisShape, centerOfMassAdjust)

    // Create the vehicle
    const vehicle = new RigidVehicle({
        chassisBody,
    })

    const mass = 1
    const axisWidth = size.z + wheelRadius * 2;
    const wheelShape = new Sphere(wheelRadius)
    const wheelMaterial = new Material('wheel')
    const down = new Vec3(0, -1, 0)

    const positions = [
        new Vec3(-halfSize.x, 0, axisWidth / 2),
        new Vec3(-halfSize.x, 0, -axisWidth / 2),
        new Vec3(halfSize.x, 0, axisWidth / 2),
        new Vec3(halfSize.x, 0, -axisWidth / 2)
    ]

    positions.forEach((position, i) => {
        const wheelBody = new Body({ mass, material: wheelMaterial })
        wheelBody.addShape(wheelShape);
        wheelBody.angularDamping = 0.4;
        vehicle.addWheel({
            body: wheelBody,
            position: position.vadd(centerOfMassAdjust),
            axis: new Vec3(0, 0, i % 2 ? 1 : -1),
            direction: down,
        })
    })

    vehicle.addToWorld(world);

    const vehicleMesh = CannonUtils.body2Mesh(chassisBody, new MeshStandardMaterial({ color: 'gray' }))
    scene.add(vehicleMesh);

    const wheelGeometry = new SphereGeometry(wheelRadius);
    const colors = ['red', 'blue', 'green', 'white'];
    const wheelMeshes = [];
    vehicle.wheelBodies.forEach((_, i) => {
        const wheelMesh = new Mesh(wheelGeometry, new MeshStandardMaterial({ color: colors[i] }));
        wheelMeshes.push(wheelMesh);
        scene.add(wheelMesh);
    });
    const maxForce = 100;
    const maxSteerVal = Math.PI / 8;
    return {
        wheelMaterial,
        update() {
            vehicleMesh.position.copy(chassisBody.position);
            vehicleMesh.quaternion.copy(chassisBody.quaternion);
            wheelMeshes.forEach((mesh, i) => {
                const body = vehicle.wheelBodies[i];
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
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
                    case 'down':
                        vehicle.setWheelForce(0, 2)
                        vehicle.setWheelForce(0, 3)
                        break;
                    case 'left':
                    case 'right':
                        vehicle.setSteeringValue(0, 0)
                        vehicle.setSteeringValue(0, 1)
                        break;
                }
            }
        }
    }
}

