/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-26 18:03:52
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
    initGroundPlane,
    initCoordinates
} from '../lib/tools/index.js';
import {
    World, Body, Material, ContactMaterial, Plane, NaiveBroadphase, Cylinder, Vec3, Trimesh, Quaternion, Box as BoxShape, ConvexPolyhedron
} from '../lib/other/physijs/cannon.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(-40, 20, 0));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix()

    const scene = initScene();

    initAmbientLight(scene);

    const world = new World({ gravity: new Vec3(0, 0, -9.82) });
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const light = initDirectionLight();
    light.shadow.camera.near = camera.near;
    light.shadow.camera.far = camera.far;
    light.shadow.camera.left = camera.left;
    light.shadow.camera.right = camera.right;
    light.shadow.camera.top = camera.top;
    light.shadow.camera.bottom = camera.bottom;
    light.position.set(-40, 40, 0);
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    createGround(scene, world)
    createColumn(scene, world)

    // 圆台

    // const columnMaterial = new MeshStandardMaterial({ color: 0x0000ff });
    // const columnNumber = 5;
    // const pice = Math.PI * 2 / columnNumber;
    // const columnGeometry = new CylinderGeometry(0.5, 0.5, 3, 32);
    // const columns = []
    // for (let index = 0; index < columnNumber; index++) {
    //     const column = new Mesh(columnGeometry, columnMaterial);
    //     column.rotateX(Math.PI / 2);
    //     column.position.x = 4 * Math.cos(pice * index);
    //     column.position.y = 4 * Math.sin(pice * index);
    //     column.position.z = 2.5;
    //     column.castShadow = true;

    //     columns.push(column)
    //     group.add(column);
    // }

    // scene.add(group);

    const coord = initCoordinates(5);
    scene.add(coord);

    // cannon


    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 })

    // const bottomShape = new Cylinder(5, 5, 1, 32);
    // const bottomBody = new Body({ mass: 1, shape: bottomShape });
    // bottomBody.material = new Material({ friction: 0.5, restitution: 0.8 });
    // bottomBody.quaternion.setFromEuler(Math.PI / 2, 0, 0, 'ZYX');
    // bottomBody.position.set(0, 0, 0.5);
    // world.addBody(bottomBody);

    // const columnShape = new Cylinder(0.5, 0.5, 3, 32);
    // const tempV = new Vector3()
    // for (let index = 0; index < columnNumber; index++) {
    //     tempV.copy(columns[index].position);
    //     tempV.z = 2
    //     tempV.applyEuler(new Euler(-Math.PI / 2, 0, 0, 'ZYX'));
    //     bottomBody.addShape(columnShape, tempV)
    // }

    const { updateTorus, torusMaterial } = createTorus(scene, world);

    // const bottomCircle = new ContactMaterial(torusMaterial, bottomBody.material, { friction: 0.1, restitution: 0.5 })
    // world.addContactMaterial(bottomCircle);



    const timeStep = 1.0 / 60.0;


    const clock = new Clock();

    function render() {
        const deltaTime = clock.getDelta();
        orbitControl.update();
        cannonDebugger.update();

        world.step(timeStep, deltaTime, 3);
        // group.quaternion.copy(bottomBody.quaternion.mult(new Quaternion().setFromEuler(-Math.PI / 2, 0, group.rotation.z + deltaTime, 'ZYX')));
        // group.position.copy(bottomBody.position);
        // group.position.z = group.position.z - 0.5;
        updateTorus();


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
    }

    gui.add(operation, 'throw');

    console.log(world);
}

function createGround(scene, world) {
    const geometry = new BoxGeometry(30, 0.5, 30);
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: 0xd8d8d8 }));
    mesh.position.y = -0.25;
    mesh.matrixAutoUpdate = false;
    mesh.matrixWorldAutoUpdate = false;
    mesh.receiveShadow = true;
    mesh.updateMatrix();
    mesh.updateMatrixWorld(true);
    scene.add(mesh);

    const shape = new BoxShape(new Vec3(15, 0.25, 15));
    const body = new Body({ mass: 0, shape, material: new Material('Ground') });
    body.position.copy(mesh.position);

    world.addBody(body);
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

function createColumn(scene, world) {
    const group = new Group();
    const cylinder = new CylinderGeometry(5, 5, 1, 32);
    const bottom = new Mesh(cylinder, new MeshStandardMaterial({ color: 0x00ff00 }));
    bottom.position.set(0, 0, 0.5);
    bottom.castShadow = bottom.receiveShadow = true;
    group.add(bottom);

    group.position.y = 0.5


    scene.add(group);

}


