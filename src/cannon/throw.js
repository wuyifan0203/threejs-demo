/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-28 18:01:41
 * @FilePath: /threejs-demo/src/cannon/throw.js
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
    ContactMaterial, 
    Sphere, 
    NaiveBroadphase, 
    Cylinder, 
    Vec3, 
    Box as BoxShape,
    DistanceConstraint
} from '../lib/other/physijs/cannon.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js';
import g from '../lib/util/lil-gui.module.min.js';

window.onload = () => {
    init();
};

const tempV3 = new Vector3();

function init() {
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(-40, 20, 0));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix()

    const scene = initScene();

    initAmbientLight(scene);

    const world = new World({ gravity: new Vec3(0, -9.82, 0) });
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

    const coord = initCoordinates(5);
    scene.add(coord);

    const orbitControl = initOrbitControls(camera, renderer.domElement);
    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    createGround(scene, world)
    // const { updateColumn } = createColumn(scene, world)
    const { updateTorus, torusMaterial } = createTorus(scene, world);

    const timeStep = 1.0 / 60.0;
    const clock = new Clock();

    function render() {
        const deltaTime = clock.getDelta();
        orbitControl.update();
        cannonDebugger.update();

        world.step(timeStep, deltaTime, 3);
        // updateTorus();
        // updateColumn();

        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();

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
    const geometry = new TorusGeometry(2, 0.1, 16, 6);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: '#00ffff' }));
    mesh.position.y = 5;

    scene.add(mesh);



    const body = CannonUtils.mesh2Body(mesh);

    console.log(body);

    body.position.copy(mesh.position);
    world.addBody(body);

    // const shape = CannonUtils.geometry2Shape(geometry);
    // const body = new Body({ mass: 0, shape, material: new Material('Torus') });
    // body.position.copy(mesh.position)
    // world.addBody(body);

    return {
        // torusMaterial: body.material,
        updateTorus() {
            // mesh.position.copy(body.position);
            // mesh.quaternion.copy(body.quaternion);
        }
    }
}

function createColumn(scene, world) {
    // create Bottom Mesh
    const cylinder = new CylinderGeometry(5, 5, 1, 16);
    const bottom = new Mesh(cylinder, new MeshStandardMaterial({ color: 0x00ff00 }));
    bottom.castShadow = bottom.receiveShadow = true;
    bottom.position.y = 0.5;

    scene.add(bottom);

    // create Bottom Body
    const body = new Body({
        type: Body.KINEMATIC,
        mass: 5,
    });
    body.angularVelocity.set(0, 1, 0);
    body.angularDamping = 0;

    const bottomShape = new Cylinder(5, 5, 1, 16);
    body.addShape(bottomShape, new Vec3(0, 0.5, 0));

    world.addBody(body);

    // create columns Mesh and Body
    const columnNumber = 5;
    const columnGeometry = new CylinderGeometry(0.5, 0.5, 3, 16)
    const columnMaterial = new MeshStandardMaterial({ color: '#ff0000' });

    const columnShape = new Cylinder(0.5, 0.5, 3, 16);

    for (let i = 0, pice = Math.PI * 2 / columnNumber; i < columnNumber; i++) {
        // create column Mesh
        const column = new Mesh(columnGeometry, columnMaterial);
        const angle = i * pice;
        column.position.x = 4 * Math.cos(angle);
        column.position.z = 4 * Math.sin(angle);
        column.position.y = 2;
        column.castShadow = column.receiveShadow = true;
        bottom.add(column);

        // create column Body
        column.getWorldPosition(tempV3);
        body.addShape(columnShape, new Vec3().copy(tempV3));
    }

    return {
        updateColumn() {
            bottom.quaternion.copy(body.quaternion);
        }
    }

}


