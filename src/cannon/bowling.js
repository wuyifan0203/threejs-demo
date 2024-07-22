/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-21 11:09:02
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 14:16:38
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
    Frustum
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initPerspectiveCamera,
    initDirectionLight,
    initCoordinates,
    resize
} from '../lib/tools/index.js';
import {
    World, Vec3, Body, Material, ContactMaterial, NaiveBroadphase, Box as BoxShape, Sphere, Cylinder,
} from '../lib/other/physijs/cannon.js';

import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

window.onload = () => {
    init();
};

const groundHalfSize = new Vector2(100, 20);
const groundSize = groundHalfSize.clone().multiplyScalar(2);


function init() {
    const renderer = initRenderer();

    const camera = initPerspectiveCamera(new Vector3(-80, 20, 0));
    camera.updateProjectionMatrix();

    const scene = initScene();

    initAmbientLight(scene);

    // cannon
    const world = new World();
    world.gravity.set(0, -10, 0);
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const light = initDirectionLight();
    light.shadow.camera.near = 5;
    light.shadow.camera.far = 200;
    light.shadow.camera.left = -groundSize.y;
    light.shadow.camera.right = groundSize.y;
    light.shadow.camera.top = 80;
    light.shadow.camera.bottom = -40;
    light.position.set(-40, 40, 0);
    scene.add(light);

    const shadowCamera = new CameraHelper(light.shadow.camera);
    shadowCamera.visible = false;
    scene.add(shadowCamera);

    const directionalLightHelper = new DirectionalLightHelper(light, 10);
    directionalLightHelper.visible = false;
    scene.add(directionalLightHelper);

    const orbitControl = initOrbitControls(camera, renderer.domElement);
    orbitControl.saveState();

    const coord = initCoordinates(16);
    coord.visible = false;
    scene.add(coord);

    const frustum = new Frustum();
    frustum.setFromProjectionMatrix(light.shadow.camera.projectionMatrix);

    const { bottleMaterial, updateBottles } = createBottles(scene, world);
    createBaffles(scene, world)
    createPlane(scene, world);

    const { updateBall, ballBody, pushBall, controlBall, checkBall, resetBall } = createBall(scene, world);

    world.addContactMaterial(new ContactMaterial(bottleMaterial, ballBody.material, { friction: 0.1, restitution: 0.7 }));

    window.addEventListener('keypress', controlBall.bind({ pushBall }))

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });
    cannonDebugger.visible = false;

    const clock = new Clock();
    (function render() {
        world.step(1 / 60, clock.getDelta());
        orbitControl.update();
        cannonDebugger.update();
        updateBottles();
        updateBall();
        renderer.render(scene, camera);

        if (checkBall && ballBody.velocity.y < -10) {
            resetBall();
        }

        requestAnimationFrame(render);
    })()


    const gui = initGUI();

    const operation = {
        pushBall,
    }

    gui.add(operation, 'pushBall');
    const debuggerFolder = gui.addFolder('debugger');

    debuggerFolder.add(cannonDebugger, 'visible').name('Cannon helper');
    debuggerFolder.add(shadowCamera, 'visible').name('Shadow camera helper');
    debuggerFolder.add(directionalLightHelper, 'visible').name('Light helper');
    debuggerFolder.add(coord, 'visible').name('Coord helper');
    debuggerFolder.add(orbitControl, 'enabled').onChange((e) => !e && orbitControl.reset()).name('God Mode')

    resize(renderer, camera);
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

    const positions = initPosition(4.5, new Vector3(60, 7, 0));

    // choose 1,使用ConvexPolyhedron来模拟。会非常的卡顿

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

    // choose 2,使用圆柱代替
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
        },
        resetBottles() {
            positions.forEach((pos, i) => {
                bottleBodies[i].position.copy(pos);
                bottleBodies[i].velocity.set(0, 0, 0);
                bottleBodies[i].angularVelocity.set(0, 0, 0);
            })
        },
    };

}

function createPlane(scene, world) {
    const groundMesh = new Mesh(new PlaneGeometry(groundSize.x, groundSize.y), new MeshPhysicalMaterial({ color: '#eeeeee' }));
    groundMesh.receiveShadow = groundMesh.castShadow = true;
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.matrixAutoUpdate = false;
    groundMesh.updateMatrix();

    scene.add(groundMesh);

    const planeBody = new Body({
        mass: 0,
        shape: new BoxShape(new Vec3(groundHalfSize.x, 0.5, groundHalfSize.y)),
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

    leftBaffles.castShadow = rightBaffles.castShadow = true;

    leftBaffles.position.z = -groundHalfSize.y;
    rightBaffles.position.z = groundHalfSize.y;

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

    leftBafflesBody.position.z = -groundHalfSize.y;
    rightBafflesBody.position.z = groundHalfSize.y;
    world.addBody(leftBafflesBody);
    world.addBody(rightBafflesBody);
}

function createBall(scene, world) {
    const ballSize = 3;
    const defaultPosition = new Vec3(-50, 3, 0);

    const mesh = new Mesh(new SphereGeometry(ballSize, 32, 32), new MeshStandardMaterial({ color: '#000000', roughness: 0.2 }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new Sphere(ballSize);
    const body = new Body({
        shape,
        mass: 10,
        material: new Material('ball')
    });
    body.position.copy(defaultPosition);

    world.addBody(body);

    window.ball = body;

    let pushFlag = false;

    const ballObject = {
        ballBody: body,
        updateBall() {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        pushBall() {
            body.applyLocalForce(new Vec3(50000, 0, 0), new Vec3());
            pushFlag = true;
        },
        controlBall(e) {
            console.log(77777,e);
            const maxDistance = Math.abs(groundHalfSize.y);
            const distance = Math.abs(body.position.z);

            if (e.key === 'A' && distance < maxDistance) {
                body.position.z -= 0.2;
                return;
            } else if (e.key === 'D' && distance < maxDistance) {
                body.position.z += 0.2;
                return;
            } else if (e.key === 'W' && pushFlag === false) {
                console.log(this);
                this.pushBall();
            }
        },

        resetBall() {
            body.position.copy(defaultPosition);
            body.velocity.set(0, 0, 0);
            body.angularVelocity.set(0, 0, 0);
            pushFlag = false;
        },
        checkBall() {
            return pushFlag;
        }
    }

    return ballObject;
}