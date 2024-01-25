/*
 * @Date: 2024-01-23 20:01:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-25 21:00:46
 * @FilePath: /threejs-demo/src/cannon/pointConstraint.js
 */
import {
    Mesh,
    Clock,
    Vector3,
    MeshPhongMaterial,
    PlaneGeometry,
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

    const planeMesh = new Mesh(new PlaneGeometry(500, 500), new MeshPhongMaterial({ color: 'gray', side: 0 }));
    planeMesh.receiveShadow = true;
    planeMesh.rotateZ(Math.PI / 2);;
    scene.add(planeMesh);



    // cannon
    const world = new World();
    world.gravity.set(0, 0, -20.8);
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const planeShape = new Plane();
    const planeBody = new Body({ mass: 0 });
    planeBody.addShape(planeShape);
    planeBody.material = new Material();
    world.addBody(planeBody);

    const maxHeight = 50;
    const space = 0.25;
    const width = 6;
    const height = 0.5;
    const depth = 4;

    const blockNumber = 10


    const blockGeometry = new BoxGeometry(width, height, depth);
    const blockMaterial = new MeshPhongMaterial({ color: 'white', side: 0 });

    const blockShape = new BoxShape(new Vec3(width / 2, height / 2, depth / 2));

    const blocksLink = [];
    const blocksBody = [];
    let mass = 0;

    let previousBlock = null;
    for (let j = 0, halfDepth = depth / 2, halfWidth = width / 2; j < blockNumber; j++) {

        const blockMesh = new Mesh(blockGeometry, blockMaterial);
        blockMesh.castShadow = true;
        blockMesh.position.set(0, 0, maxHeight - j * (space * 2 + depth));
        blocksLink.push(blockMesh);
        blockMesh.name = `blockMesh-${j}`;

        const blockBody = new Body({ mass, shape: blockShape });
        blockBody.position.copy(blockMesh.position);
        blocksBody.push(blockBody);
        blockBody.name = `blocksBody-${j}`;

        blockBody.linearDamping = 0.01; // Damping makes the movement slow down with time
        blockBody.angularDamping = 0.01;

        // 遇到的问题，mass 在构造好时为0，
        // 需要通过代码动态修改 重新赋值
        // 修改Body.type后 为 Body.DYNAMIC 后依然不会生效
        if (j === 0) {
            // 第一个固   blockBody.type = Body.STATIC;定不动
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

            const previousBlockMesh = blocksLink[j - 1].localToWorld(new Vector3().copy(p2pConstraintLeft.pivotA));
            const blockMesh = blocksLink[j].localToWorld(new Vector3().copy(p2pConstraintLeft.pivotB));


            world.addConstraint(p2pConstraintLeft);
            world.addConstraint(p2pConstraintRight);

        }
        previousBlock = blockBody

        // console.log(blockBody.mass, blockBody.type);

        world.addBody(blockBody);

        scene.add(blockMesh);
    }


    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    const clock = new Clock();
    function render() {
        world.step(1 / 120, clock.getDelta());

        cannonDebugger.update();

        orbitControl.update();
        renderer.render(scene, camera);

        blocksLink.forEach((mesh, i) => {
            mesh.position.copy(blocksBody[i].position);
            mesh.quaternion.copy(blocksBody[i].quaternion);
        })

    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();
    gui.add(cannonDebugger._object, 'visible').name('debugger')

    window.world = world;
}
