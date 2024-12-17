/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:03:35
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
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initCoordinates,
    resize
} from '../lib/tools/index.js';
import {
    World,
    Body,
    Material,
    ContactMaterial,
    NaiveBroadphase,
    Cylinder,
    Vec3,
    Box as BoxShape,
} from '../lib/other/physijs/cannon.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js';

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
    orbitControl.enabled = false;
    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });
    cannonDebugger.visible = false;

    createGround(scene, world)
    const { updateColumn, columnBody } = createColumn(scene, world);
    const { updateTorus, torusBody, resetTorus, throwTorus } = createTorus(scene, world);

    const containMaterial = new ContactMaterial(columnBody.material, torusBody.material, {
        friction: 0.1,
        restitution: 0.2,
    });

    world.addContactMaterial(containMaterial);

    const timeStep = 1.0 / 60.0;
    const clock = new Clock();

    (function render() {
        const deltaTime = clock.getDelta();
        orbitControl.update();
        cannonDebugger.update();

        world.step(timeStep, deltaTime, 3);
        updateTorus();
        updateColumn();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    })()



    const operation = {
        reset() {
            resetTorus()
        },
        throw() {
            throwTorus(this.force);
        },
        force: new Vec3(10, 10, 0),
    }

    const gui = initGUI();
    gui.add(operation, 'throw');
    gui.add(operation, 'reset');

    const forceFolder = gui.addFolder('Force')

    forceFolder.add(operation.force, 'x', 0, 20, 0.1);
    forceFolder.add(operation.force, 'y', 0, 20, 0.1);
    forceFolder.add(operation.force, 'z', 0, 20, 0.1);


    const debuggerFolder = gui.addFolder('debugger');
    debuggerFolder.close();
    debuggerFolder.add(cannonDebugger, 'visible').name('Cannon Debugger Visible');
    debuggerFolder.add(orbitControl, 'enabled').name('Orbit Control Enabled');

    resize(renderer, camera)
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
    const geometry = new TorusGeometry(2, 0.1, 8, 16);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: '#ffff00' }));
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);

    const body = CannonUtils.mesh2Body(mesh);
    body.position.set(-20, 5, 0);
    body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
    world.addBody(body);

    return {
        torusBody: body,
        updateTorus() {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        throwTorus(force) {
            body.mass = 1;
            body.applyImpulse(force, new Vec3(0, 0, 0));
        },
        resetTorus() {
            body.position.set(-20, 5, 0);
            body.velocity.set(0, 0, 0);
            body.angularVelocity.set(0, 0, 0);
            body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
            body.mass = 0;
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
        material: new Material('Column')
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
        columnBody: body,
        updateColumn() {
            bottom.quaternion.copy(body.quaternion);
        }
    }

}


