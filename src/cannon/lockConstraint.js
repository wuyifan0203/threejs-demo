/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-23 20:57:31
 * @FilePath: /threejs-demo/src/cannon/lockConstraint.js
 */
import {
    Mesh,
    Clock,
    SphereGeometry,
    Vector3,
    MeshPhongMaterial,
    PlaneGeometry,
    MeshStandardMaterial,
    BoxGeometry
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initSpotLight,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initCoordinates
} from '../lib/tools/index.js';
import {
    World, Sphere, Body, Material, ContactMaterial, Plane, NaiveBroadphase, Box as BoxShape, Vec3
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
    light.shadow.camera.left = -50
    light.shadow.camera.right = 50
    light.shadow.camera.top = 50 * aspect
    light.shadow.camera.bottom = -50 * aspect
    light.shadow.camera.near = camera.near
    light.shadow.camera.far = camera.far
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    // constant

    const standerMaterial = new MeshStandardMaterial({ color: 'gray' });
    const standerGeometry = new BoxGeometry(40, 20, 20);
    const standerMesh1 = new Mesh(standerGeometry, standerMaterial);
    standerMesh1.castShadow = true;
    standerMesh1.rotateY(-Math.PI / 6)
    standerMesh1.position.set(-40, 0, 0);
    scene.add(standerMesh1);

    const standerMesh2 = new Mesh(standerGeometry, standerMaterial);
    standerMesh2.castShadow = true;
    standerMesh2.position.set(40, 0, 0);
    standerMesh2.rotateY(Math.PI / 6)
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
    standerBody1.quaternion.copy(standerMesh1.quaternion);
    world.addBody(standerBody1);

    const standerBody2 = new Body({ mass: 0, shape: standerBoxShape });
    standerBody2.position.copy(standerMesh2.position);
    standerBody2.quaternion.copy(standerMesh2.quaternion);
    world.addBody(standerBody2);

    const planeShape = new Plane();
    const planeBody = new Body({ mass: 0 });
    planeBody.addShape(planeShape);
    planeBody.material = new Material();
    world.addBody(planeBody);

    const bridgeGeometry = new BoxGeometry(2, 20, 1);
    const bridgeMAterial = new MeshStandardMaterial({ color: 'white' });

    const bridgeShape = new BoxShape(new Vec3(1, 10, 0.5));
   
    const bridgeBlocks = []

    for (let j = 0; j < 27; j++) {
        const bridgeBlock = new Mesh(bridgeGeometry, bridgeMAterial);
        bridgeBlock.position.set(53 - j * 2 - 27, 0, 18);
        scene.add(bridgeBlock);
        const bridgeBody = new Body({ mass: 2, shape: bridgeShape });
        bridgeBody.position.copy(bridgeBlock.position);
        bridgeBlocks.push(bridgeBlock);
    }


    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 })

    const clock = new Clock();
    function render() {
        world.step(1 / 120, clock.getDelta());

        cannonDebugger.update();

        orbitControl.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();

    const control = {

    };

    window.world = world;
}
