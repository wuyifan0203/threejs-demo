/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-25 18:09:11
 * @FilePath: /threejs-demo/src/cannon/throw.js
 */
import {
    Mesh,
    Clock,
    Euler,
    Vector3,
    TorusGeometry,
    Group,
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
    initGroundPlane
} from '../lib/tools/index.js';
import {
    World, Body, Material, ContactMaterial, Plane, NaiveBroadphase, Cylinder, Vec3, Trimesh, Quaternion, Box, ConvexPolyhedron
} from '../lib/other/physijs/cannon.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));

    const scene = initScene();

    initGroundPlane(scene);
    initAmbientLight(scene);

    const light = initDirectionLight();
    light.shadow.camera.near = camera.near;
    light.shadow.camera.far = camera.far;
    light.shadow.camera.left = camera.left;
    light.shadow.camera.right = camera.right;
    light.shadow.camera.top = camera.top;
    light.shadow.camera.bottom = camera.bottom;
    light.position.set(40, 40, 70);
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const group = new Group();
    const cylinder = new CylinderGeometry(5, 5, 1, 32);
    cylinder.rotateX(Math.PI / 2);
    // 圆台
    const bottomMaterial = new MeshStandardMaterial({ color: 0x00ff00 });
    const bottom = new Mesh(cylinder, bottomMaterial);
    bottom.position.set(0, 0, 0.5);
    bottom.castShadow = bottom.receiveShadow = true;
    group.add(bottom);

    const columnMaterial = new MeshStandardMaterial({ color: 0x0000ff });
    const columnNumber = 5;
    const pice = Math.PI * 2 / columnNumber;
    const columnGeometry = new CylinderGeometry(0.5, 0.5, 3, 32);
    const columns = []
    for (let index = 0; index < columnNumber; index++) {
        const column = new Mesh(columnGeometry, columnMaterial);
        column.rotateX(Math.PI / 2);
        column.position.x = 4 * Math.cos(pice * index);
        column.position.y = 4 * Math.sin(pice * index);
        column.position.z = 2.5;
        column.castShadow = true;

        columns.push(column)
        group.add(column);
    }

    scene.add(group);

    const testBox = new Mesh(new BoxGeometry(2, 2, 2), new MeshStandardMaterial({ color: 0xff0000 }));
    testBox.position.z = 10;
    scene.add(testBox)

    // 小环
    const circle = new TorusGeometry(2, 0.1, 6, 16);
    const circleMaterial = new MeshStandardMaterial({ color: 0xff0000 });
    const circleMesh = new Mesh(circle, circleMaterial);

    circleMesh.position.z = 2.5;
    circleMesh.castShadow = true;
    scene.add(circleMesh);

    // cannon
    const world = new World({ gravity: new Vec3(0, 0, -9.82) });
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 })

    const groundShape = new Plane();
    const groundBody = new Body({ mass: 0, shape: groundShape });
    groundBody.material = new Material({ friction: 0.5, restitution: 0.3 })
    world.addBody(groundBody);

    const bottomShape = new Cylinder(5, 5, 1, 32);
    const bottomBody = new Body({ mass: 1, shape: bottomShape });
    bottomBody.material = new Material({ friction: 0.5, restitution: 0.8 });
    bottomBody.quaternion.setFromEuler(Math.PI / 2, 0, 0, 'ZYX');
    bottomBody.position.set(0, 0, 0.5);
    world.addBody(bottomBody);

    const columnShape = new Cylinder(0.5, 0.5, 3, 32);
    const tempV = new Vector3()
    for (let index = 0; index < columnNumber; index++) {
        tempV.copy(columns[index].position);
        tempV.z = 2
        tempV.applyEuler(new Euler(-Math.PI / 2, 0, 0, 'ZYX'));
        bottomBody.addShape(columnShape, tempV)
    }

    const { updateTorus, torusMaterial } = createTorus(scene, world);

    const groundCircle = new ContactMaterial(torusMaterial, groundBody.material, { friction: 0.1, restitution: 0.8 });
    const bottomCircle = new ContactMaterial(torusMaterial, bottomBody.material, { friction: 0.1, restitution: 0.5 })
    world.addContactMaterial(groundCircle);
    world.addContactMaterial(bottomCircle);

    const testBody = new Body({ mass: 1, shape: new Box(new Vec3(1, 1, 1)) });
    world.addBody(testBody);


    const timeStep = 1.0 / 60.0;


    const clock = new Clock();

    function render() {
        const deltaTime = clock.getDelta();
        orbitControl.update();
        cannonDebugger.update();

        world.step(timeStep, deltaTime, 3);
        group.quaternion.copy(bottomBody.quaternion.mult(new Quaternion().setFromEuler(-Math.PI / 2, 0, group.rotation.z + deltaTime, 'ZYX')));
        group.position.copy(bottomBody.position);
        group.position.z = group.position.z - 0.5;
        updateTorus();

        testBox.position.copy(testBody.position);
        testBox.quaternion.copy(testBody.quaternion);

        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();

    const offset = new Vec3(0, 0, 0);

    const operation = {
        throw() {
            const force = new Vec3(0, 50, 1000);
            const impulse = force.scale(timeStep); // 将力转换为冲量
            circleBody.applyImpulse(impulse, offset)
        },
        dropTest() {
            testBody.position.set(0, 0, 10);
            testBody.quaternion.setFromEuler(0, 0, 0, 'ZYX')
        }
    }

    gui.add(operation, 'throw');
    gui.add(operation, 'dropTest');

    console.log(world);
}

function createTorus(scene, world) {
    const geometry = new TorusGeometry(2, 0.1, 6, 16);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: '#00ffff' }));
    mesh.position.y = 1;

    scene.add(mesh);

    const shape = CannonUtils.geometry2Shape(2, 0.1, 16, 16);
    const body = new Body({ mass: 1, shape, material: new Material('Torus') });
    body.position.copy(mesh.position)
    world.addBody(body);

    return {
        torusMaterial: body.material,
        updateTorus() {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        }
    }
}
