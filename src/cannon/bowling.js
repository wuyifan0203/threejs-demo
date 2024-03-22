/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-21 11:09:02
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-22 16:27:56
 * @FilePath: /threejs-demo/src/cannon/bowling.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector2,
    Vector3,
    Clock,
    SplineCurve,
    LatheGeometry,
    ShaderMaterial,
    PlaneGeometry,
    MeshBasicMaterial,
    DirectionalLightHelper,
    MeshPhysicalMaterial,
    CameraHelper,
    BoxGeometry,
    SphereGeometry,
    MeshStandardMaterial,
    Matrix4,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initPerspectiveCamera,
    initDirectionLight,
    initCoordinates
} from '../lib/tools/index.js';
import {
    World, Vec3, Body, Material, ContactMaterial, Plane, NaiveBroadphase, ConvexPolyhedron, Box as BoxShape, Sphere, Cylinder,
} from '../lib/other/physijs/cannon.js';

import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();

    const camera = initPerspectiveCamera(new Vector3(-60, 20, 0));
    camera.updateProjectionMatrix();

    const scene = initScene();

    initAmbientLight(scene);

    // cannon
    const world = new World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const light = initDirectionLight();
    light.shadow.camera.near = 5;
    light.shadow.camera.far = 200;
    light.shadow.camera.left = -40;
    light.shadow.camera.right = 40;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -40;
    light.position.set(-40, 40, 0);
    scene.add(light);

    const shadowCamera = new CameraHelper(light.shadow.camera)
    scene.add(shadowCamera);

    // scene.add(new DirectionalLightHelper(light, 10));

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    scene.add(initCoordinates(16));


    const { bottleMaterial, updateBottles } = createBottles(scene, world);
    createBaffles(scene, world)
    createPlane(scene, world);

    const { updateBall, ballMaterial, pushBall } = createBall(scene, world);

    world.addContactMaterial(new ContactMaterial(bottleMaterial, ballMaterial, { friction: 0.1, restitution: 0.7 }));

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    const clock = new Clock();
    function update() {
        world.step(1 / 60, clock.getDelta());
        orbitControl.update();
        // cannonDebugger.update();
        updateBottles();
        updateBall();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(update);

    const gui = initGUI();

    const operation = {
        pushBall,
    }

    gui.add(operation, 'pushBall')
}

function initPosition(radius, offset = new Vector3(0, 0, 0)) {
    const sr = Math.sqrt(3) * radius;
    const positions = [
        new Vector3(0, 0, 0),
        new Vector3(sr, 0, -radius),
        new Vector3(sr, 0, radius),
        new Vector3(sr * 2, 0, -radius * 2),
        new Vector3(sr * 2, 0, 0),
        new Vector3(sr * 2, 0, radius * 2),
        new Vector3(sr * 3, 0, -radius * 3),
        new Vector3(sr * 3, 0, -radius,),
        new Vector3(sr * 3, 0, radius,),
        new Vector3(sr * 3, 0, radius * 3),
    ];
    return positions.map(v => v.add(offset));
}

function createBottles(scene, world) {
    const line = new SplineCurve([
        new Vector2(2, 0),
        new Vector2(2.4, 6),
        new Vector2(2.3, 8),
        new Vector2(0.8, 10),
    ]);

    const line2 = new SplineCurve([
        new Vector2(0.8, 13),
        new Vector2(0.5, 13.5),
        new Vector2(0, 13.8),
    ]);

    const points = [
        new Vector2(0, 0),
        ...line.getPoints(20),
        new Vector2(0.8, 13),
        ...line2.getPoints(5),
    ];

    const geometry = new LatheGeometry(points, 16).applyMatrix4(new Matrix4().makeTranslation(0, -7, 0));
    const material = new ShaderMaterial({
        vertexShader: /*glsl*/`
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main() {
                vNormal = normal;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader:/*glsl*/ `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
            //光线向量
            vec3 light = vec3(40.0, 40.0, 70.0);
            float y = vPosition.y;
            float c = 0.4 * pow( dot(light, vNormal) / length(light), 2.0);
            float withinRange = step(3.2, y) * step(y, 3.8) + step(4.1, y) * step(y, 4.7);

            vec3 color = vec3(1.0, c, c) * withinRange + vec3(c + 0.6) * (1.0 - withinRange);
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    });

    const positions = initPosition(2.5, new Vector3(60, 7, 0));

    // const vertices = [];
    // const faces = [];
    // const positionBuffer = geometry.getAttribute('position').array;
    // const indexBuffer = geometry.getIndex().array;

    // for (let j = 0, k = positionBuffer.length; j < k; j += 3) {
    //     const x = positionBuffer[j];
    //     const y = positionBuffer[j + 1];
    //     const z = positionBuffer[j + 2];
    //     vertices.push(new Vec3(x, y, z));
    // }

    // for (let j = 0, k = indexBuffer.length; j < k; j += 3) {
    //     const x = indexBuffer[j];
    //     const y = indexBuffer[j + 1];
    //     const z = indexBuffer[j + 2];
    //     faces.push([x, y, z]);
    // }

    // const shape = new ConvexPolyhedron({ vertices, faces });

    const shape = new Cylinder(2.5, 2.5, 14)

    const physicsMaterial = new Material('bottle');

    const bottleMeshes = [];
    const bottleBodies = [];

    positions.forEach((pos) => {
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(pos);
        bottleMeshes.push(mesh);
        mesh.receiveShadow = mesh.castShadow = true;
        scene.add(mesh);

        const body = new Body({ mass: 1, material: physicsMaterial, shape });
        body.position.copy(pos);
        bottleBodies.push(body);
        world.addBody(body);
    })

    return {
        bottleMaterial: physicsMaterial,
        updateBottles() {
            bottleMeshes.forEach((mesh, i) => {
                mesh.position.copy(bottleBodies[i].position);
                mesh.quaternion.copy(bottleBodies[i].quaternion);
            });
        }
    };

}

function createPlane(scene, world) {
    const groundMesh = new Mesh(new PlaneGeometry(200, 200), new MeshPhysicalMaterial({ color: '#eeeeee' }));
    groundMesh.receiveShadow = groundMesh.castShadow = true;
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.matrixAutoUpdate = false;
    groundMesh.updateMatrix();

    scene.add(groundMesh);

    const planeBody = new Body({
        mass: 0,
        shape: new BoxShape(new Vec3(100, 1, 100)),
        material: new Material('ground')
    });
    planeBody.position.y = -0.5;

    world.addBody(planeBody)
}

function createBaffles(scene, world) {
    const geometry = new BoxGeometry(100, 20, 1);
    const material = new MeshBasicMaterial({ color: '#00ffff' });
    const leftBaffles = new Mesh(geometry, material);
    const rightBaffles = new Mesh(geometry, material);

    leftBaffles.matrixAutoUpdate = false;
    rightBaffles.matrixAutoUpdate = false;
    leftBaffles.matrixWorldAutoUpdate = false;
    rightBaffles.matrixWorldAutoUpdate = false;
    leftBaffles.castShadow = rightBaffles.castShadow = true;

    leftBaffles.position.z = -12;
    rightBaffles.position.z = 12;

    leftBaffles.updateMatrix();
    rightBaffles.updateMatrix();

    scene.add(leftBaffles, rightBaffles);

    const shape = new BoxShape(new Vec3(50, 10, 0.5));
    const physicMaterial = new Material('baffle');
    const leftBafflesBody = new Body({
        shape,
        material: physicMaterial,
        mass: 0
    });

    const rightBafflesBody = new Body({
        shape,
        material: physicMaterial,
        mass: 0
    });

    leftBafflesBody.position.z = -12;
    rightBafflesBody.position.z = 12;
    world.addBody(leftBafflesBody, rightBafflesBody);
}

function createBall(scene, world) {
    const mesh = new Mesh(new SphereGeometry(5, 32, 32), new MeshStandardMaterial({ color: '#000000', roughness: 0.2 }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 5;
    mesh.position.x = -50;
    scene.add(mesh);

    console.log(mesh.material);

    const shape = new Sphere(5);
    const body = new Body({
        shape,
        mass: 10,
        material: new Material('ball')
    });
    body.position.copy(mesh.position);

    world.addBody(body);

    window.ball = body

    return {
        ballMaterial: body.material,
        updateBall() {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        pushBall() {
            console.log('push');
            body.applyLocalForce(new Vec3(50000, 0, 0), new Vec3());
        }
    }
}