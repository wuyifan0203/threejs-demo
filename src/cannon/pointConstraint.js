/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 14:35:00
 * @FilePath: /threejs-demo/src/cannon/pointConstraint.js
 */
import {
    Mesh,
    Clock,
    Vector3,
    MeshPhongMaterial,
    PlaneGeometry,
    BoxGeometry,
    MeshStandardMaterial,
    SphereGeometry
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initCoordinates,
    rainbowColors,
    resize
} from '../lib/tools/index.js';
import {
    World,
    Body,
    Material,
    ContactMaterial,
    NaiveBroadphase,
    Box as BoxShape,
    Vec3,
    PointToPointConstraint,
    Sphere,
    GSSolver,
    SplitSolver
} from '../lib/other/physijs/cannon.js';

import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(0, -300, 300));
    camera.zoom = 0.1;
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

    // init physic world 

    const world = new World();
    world.gravity.set(0, 0, -10);
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const solver = new GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;
    world.solver = new SplitSolver(solver);

    // 初始化地面

    const planeMesh = new Mesh(new PlaneGeometry(200, 200), new MeshPhongMaterial({ color: 'gray', side: 0 }));
    planeMesh.receiveShadow = true;
    planeMesh.rotateZ(Math.PI / 2);;
    scene.add(planeMesh);

    const groundMaterial = new Material({ friction: 0.9, restitution: 0.9 });
    const planeShape = new BoxShape(new Vec3(100, 100, 1));
    const planeBody = new Body({ mass: 0, material: groundMaterial });
    planeBody.position.set(0, 0, -1);
    planeBody.addShape(planeShape);
    planeBody.material = new Material();
    world.addBody(planeBody);

    // 初始化约束物体
    const maxHeight = 50;
    const space = 0.25;
    const width = 6;
    const height = 0.5;
    const depth = 4;

    const blockNumber = 10;

    const blocksLink = [];
    const blocksBody = [];
    let mass = 0;

    const blockGeometry = new BoxGeometry(width, height, depth);
    const blockMaterial = new MeshPhongMaterial({ color: 'white', side: 0 });

    const blockShape = new BoxShape(new Vec3(width / 2, height / 2, depth / 2));
    const blockBodyMaterial = new Material({ friction: 0.1, restitution: 0.7 });

    let previousBlock = null;
    for (let j = 0, halfDepth = depth / 2, halfWidth = width / 2; j < blockNumber; j++) {

        const blockMesh = new Mesh(blockGeometry, blockMaterial);
        blockMesh.castShadow = true;
        blockMesh.position.set(0, 0, maxHeight - j * (space * 2 + depth));
        blocksLink.push(blockMesh);

        const blockBody = new Body({ mass, shape: blockShape, material: blockBodyMaterial });
        blockBody.position.copy(blockMesh.position);
        blocksBody.push(blockBody);

        blockBody.linearDamping = 0.01; // Damping makes the movement slow down with time
        blockBody.angularDamping = 0.01;

        // 遇到的问题，mass 在构造好时为0，
        // 需要通过代码动态修改 重新赋值
        // 修改Body.type后 为 Body.DYNAMIC 后依然不会生效
        //  查源码发现需要调用updateMassProperties
        if (j === 0) {
            // 第一个固定不动   blockBody.type = Body.STATIC;
            mass = 0.3
        } else {
            const p2pConstraintLeft = new PointToPointConstraint(
                blockBody, new Vec3(-halfWidth, 0, halfDepth + space),
                previousBlock, new Vec3(-halfWidth, 0, -halfDepth - space),
            );

            const p2pConstraintRight = new PointToPointConstraint(
                blockBody, new Vec3(halfWidth, 0, halfDepth + space),
                previousBlock, new Vec3(halfWidth, 0, -halfDepth - space),
            )

            world.addConstraint(p2pConstraintLeft);
            world.addConstraint(p2pConstraintRight);
        }
        previousBlock = blockBody

        world.addBody(blockBody);
        scene.add(blockMesh);
    }

    const cameraDirection = new Vector3().copy(camera.position).sub(orbitControl.target).normalize();
    orbitControl.addEventListener('change', () => {
        cameraDirection.copy(camera.position).sub(orbitControl.target).normalize();
    })

    // shoot ball
    const sphereArray = [];
    const velocity = new Vector3();
    const sphereGeometry = new SphereGeometry(2, 32, 32);
    const materialPool = rainbowColors.map((color) => new MeshStandardMaterial({ color }));

    const sphereShape = new Sphere(2);
    const sphereBodyMaterial = new Material({ restitution: 0.8 });

    const control = {
        speed: 100
    }


    renderer.domElement.addEventListener('click', (evt) => {
        const sphereMesh = new Mesh(sphereGeometry, materialPool[sphereArray.length % materialPool.length]);
        sphereMesh.receiveShadow = sphereMesh.castShadow = true;
        sphereMesh.position.copy(camera.position);
        sphereMesh.position.z = 100;
        scene.add(sphereMesh);
        sphereArray.push(sphereMesh);

        const body = new Body({ mass: 1, shape: sphereShape, material: sphereBodyMaterial });
        body.position.copy(sphereMesh.position);
        velocity.copy(cameraDirection.negate()).multiplyScalar(control.speed);
        velocity.z = 0;
        body.velocity.copy(velocity);
        world.addBody(body);

        sphereMesh.userData.body = body;
    })

    // 约束物体与约束物体
    const blockBodyContactMaterial = new ContactMaterial(blockBodyMaterial, blockBodyMaterial, { friction: 0.3, restitution: 0.5 });
    world.addContactMaterial(blockBodyContactMaterial);

    // 小球碰小球
    const sphereContactMaterial = new ContactMaterial(sphereBodyMaterial, sphereBodyMaterial, { restitution: 0.9 });
    world.addContactMaterial(sphereContactMaterial);

    // 地面与小球
    const groundSphereContactMaterial = new ContactMaterial(sphereBodyMaterial, groundMaterial, { restitution: 1, friction: 0.1 });
    world.addContactMaterial(groundSphereContactMaterial);


    const clock = new Clock();
    const disposeArray = [];

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    (function render() {
        world.step(1 / 120, clock.getDelta());
        cannonDebugger.update();
        renderer.render(scene, camera);

        // 更新约束物体
        blocksLink.forEach((mesh, i) => {
            mesh.position.copy(blocksBody[i].position);
            mesh.quaternion.copy(blocksBody[i].quaternion);
        })

        // 更新射击小球位置
        disposeArray.length = 0;

        for (let j = 0, k = sphereArray.length; j < k; j++) {
            const mesh = sphereArray[j];
            if (mesh.position.z < -20) {
                disposeArray.push(j);
                continue;
            } else {
                mesh.position.copy(mesh.userData.body.position);
                mesh.quaternion.copy(mesh.userData.body.quaternion);
            }
        }

        // 销毁越界小球
        disposeArray.forEach((index) => {
            const mesh = sphereArray[index];
            mesh.removeFromParent();
            world.removeBody(mesh.userData.body);
            sphereArray.splice(index, 1);
        })

        requestAnimationFrame(render);
    })()

    cannonDebugger._object.visible = false;
    const gui = initGUI();
    gui.add(cannonDebugger._object, 'visible').name('debugger');
    gui.add(control, 'speed', 10, 1000, 10);
    gui.add(groundSphereContactMaterial, 'friction', 0, 1, 0.01).name('ground friction');
    gui.add(groundSphereContactMaterial, 'restitution', 0, 1, 0.01).name('ground restitution');

    window.world = world;

    resize(renderer, camera);
}
