/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-24 14:25:21
 * @FilePath: /threejs-demo/src/cannon/lockConstraint.js
 */
import {
    Mesh,
    Clock,
    Vector3,
    MeshPhongMaterial,
    PlaneGeometry,
    MeshStandardMaterial,
    BoxGeometry,
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
    Plane,
    NaiveBroadphase,
    Box as BoxShape,
    Vec3,
    LockConstraint,
    PointToPointConstraint,
} from '../lib/other/physijs/cannon.js';

import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(0, -500, 500));
    camera.zoom = 0.5;
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();

    initAmbientLight(scene);

    scene.add(initCoordinates(50))

    const aspect = window.innerWidth / window.innerHeight;

    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    light.shadow.camera.left = -100
    light.shadow.camera.right = 100
    light.shadow.camera.top = 100 * aspect
    light.shadow.camera.bottom = -100 * aspect
    light.shadow.camera.near = camera.near
    light.shadow.camera.far = camera.far
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);
    // constant

    const standerMaterial = new MeshStandardMaterial({ color: 'gray' });
    const standerGeometry = new BoxGeometry(40, 20, 20);
    const standerMesh1 = new Mesh(standerGeometry, standerMaterial);
    standerMesh1.castShadow = true;
    standerMesh1.position.set(-44, 0, 0);
    scene.add(standerMesh1);

    const standerMesh2 = new Mesh(standerGeometry, standerMaterial);
    standerMesh2.castShadow = true;
    standerMesh2.position.set(44, 0, 0);
    scene.add(standerMesh2);

    const planeMesh = new Mesh(new PlaneGeometry(500, 500), new MeshPhongMaterial({ color: 'gray', side: 0 }));
    planeMesh.receiveShadow = true;
    planeMesh.rotateZ(Math.PI / 2);;
    scene.add(planeMesh);


    // cannon
    const world = new World();
    world.gravity.set(0, 0, -9.8);
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const standerBoxShape = new BoxShape(new Vec3(20, 10, 10));
    const standerBody1 = new Body({ mass: 0, shape: standerBoxShape });
    standerBody1.position.copy(standerMesh1.position);
    world.addBody(standerBody1);

    const standerBody2 = new Body({ mass: 0, shape: standerBoxShape });
    standerBody2.position.copy(standerMesh2.position);
    world.addBody(standerBody2);

    const planeShape = new Plane();
    const planeBody = new Body({ mass: 0 });
    planeBody.addShape(planeShape);
    planeBody.material = new Material();
    world.addBody(planeBody);

    const bridgeGeometry = new BoxGeometry(2, 20, 1);
    const bridgeMaterial = new MeshStandardMaterial({ color: 'white' });

    const bridgeShape = new BoxShape(new Vec3(1, 10, 0.5));

    const bridgeBlocks = [];
    const blockBodies = [];
    const space = 0.5

    let previous;
    for (let j = 0; j < 14; j++) {
        const bridgeBlock = new Mesh(bridgeGeometry, bridgeMaterial);
        bridgeBlock.castShadow = bridgeBlock.receiveShadow = true;
        const width = space * 2 + 2
        bridgeBlock.position.set(40 - j * width - 20, 0, 10);
        scene.add(bridgeBlock);
        bridgeBlocks.push(bridgeBlock);

        const bridgeBody = new Body({ mass: 2, shape: bridgeShape });
        bridgeBlock.userData.body = bridgeBody;
        bridgeBody.position.copy(bridgeBlock.position);
        world.addBody(bridgeBody);
        blockBodies.push(bridgeBody);
        if (previous) {
            const lockConstraint = new LockConstraint(bridgeBody, previous)
            world.addConstraint(lockConstraint)
        }

        previous = bridgeBody
    }

    // 基于Body的相对位置
    const pointLeft1 = new PointToPointConstraint(
        standerBody1, new Vec3(20, 8, 10),
        blockBodies[0], new Vec3(1, 8, -0.5)
    );
    const pointLeft2 = new PointToPointConstraint(
        standerBody1, new Vec3(20, -8, 10),
        blockBodies[0], new Vec3(1, -8, -0.5)
    );
    const pointRight1 = new PointToPointConstraint(
        standerBody2, new Vec3(-20, 8, 10),
        previous, new Vec3(-1, 8, -0.5)
    );
    const pointRight2 = new PointToPointConstraint(
        standerBody2, new Vec3(-20, -8, 10),
        previous, new Vec3(-1, -8, -0.5)
    );


    world.addConstraint(pointLeft1);
    world.addConstraint(pointLeft2);
    world.addConstraint(pointRight1);
    world.addConstraint(pointRight2);

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    const clock = new Clock();
    function render() {
        world.step(1 / 120, clock.getDelta());

        cannonDebugger.update();

        orbitControl.update();
        renderer.render(scene, camera);
        blockBodies.forEach((body, i) => {
            bridgeBlocks[i].position.copy(body.position);
            bridgeBlocks[i].quaternion.copy(body.quaternion);
        })
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();
    gui.add(cannonDebugger._object, 'visible').name('debugger')

    window.world = world;
}
