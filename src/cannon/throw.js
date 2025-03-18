/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-18 16:12:07
 * @FilePath: \threejs-demo\src\cannon\throw.js
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
    Color,
} from 'three';
import {
    initRenderer,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    resize,
    getRainbowColor,
    initPerspectiveCamera
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

    const camera = initPerspectiveCamera(new Vector3(-35, 18, 0));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix()

    const scene = initScene();

    initAmbientLight(scene);

    const world = new World({ gravity: new Vec3(0, -9.82, 0) });
    world.broadphase = new NaiveBroadphase();
    world.defaultContactMaterial.contactEquationRelaxation = 5;
    world.defaultContactMaterial.contactEquationStiffness = 1e7;

    const light = initDirectionLight();
    light.position.set(-40, 40, -40);
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });
    cannonDebugger.visible = false;

    const tori = [];

    createGround(scene, world)
    const column = createColumn(scene, world);
    let currentTorus = createTorus(scene, world);


    world.addContactMaterial(new ContactMaterial(columnPsyMaterial, torusPsyMaterial, {
        friction: 0.1,
        restitution: 0.2,
    }));

    world.addContactMaterial(new ContactMaterial(torusPsyMaterial, torusPsyMaterial, {
        friction: 0.1,
        restitution: 0.1,
    }));

    const timeStep = 1.0 / 60.0;
    const clock = new Clock();

    function updateTori() {
        tori.forEach(torus => {
            torus.update();
        })
    }

    function render() {
        orbitControl.update();
        cannonDebugger.update();

        world.step(timeStep, clock.getDelta(), 3);
        updateTori();
        column.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    render();


    const operation = {
        resetAll() {
            tori.forEach(torus => {
                torus.dispose();
            })
        },
        throwTorus() {
            currentTorus.throw(this.force);
            tori.push(currentTorus);

            setTimeout(() => {
                currentTorus = createTorus(scene, world);
            }, 800)
        },
        force: new Vec3(10, 10, 0),
    }

    const gui = initGUI();
    gui.add(operation, 'throwTorus');
    gui.add(operation, 'resetAll');

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
const groundPsyMaterial = new Material('Ground');
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
    const body = new Body({ mass: 0, material: groundPsyMaterial });
    body.addShape(shape, new Vec3(0, 0, 0));

    world.addBody(body);
}

const torusPsyMaterial = new Material('Torus');
function createTorus(scene, world) {
    const geometry = new TorusGeometry(2, 0.1, 8, 16);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: new Color(getRainbowColor()) }));
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);

    const body = CannonUtils.mesh2Body(mesh);
    body.material = torusPsyMaterial;
    body.mass = 0;
    body.position.set(-20, 5, 0);
    body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2);
    world.addBody(body);

    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    return {
        body,
        update() {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        throw(force) {
            body.mass = 1;
            body.applyImpulse(force, new Vec3(0, 0, 0));
        },
        dispose() {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            world.removeBody(body);
        }
    }
}

const columnPsyMaterial = new Material('Column');
function createColumn(scene, world) {
    // create Bottom Mesh
    const cylinder = new CylinderGeometry(5, 5, 1, 64);
    const bottom = new Mesh(cylinder, new MeshStandardMaterial({ color: 0xceff00 }));
    bottom.castShadow = bottom.receiveShadow = true;
    bottom.position.y = 0.5;

    scene.add(bottom);

    // create Bottom Body
    const body = new Body({
        type: Body.KINEMATIC,
        mass: 5,
        material: columnPsyMaterial
    });
    body.angularVelocity.set(0, 1, 0);
    body.angularDamping = 0;

    const bottomShape = new Cylinder(5, 5, 1, 32);
    body.addShape(bottomShape, new Vec3(0, 0.5, 0));

    world.addBody(body);

    // create columns Mesh and Body
    const columnNumber = 5;
    const columnGeometry = new CylinderGeometry(0.5, 0.5, 3, 5);
    columnGeometry.computeVertexNormals();
    const columnMaterial = new MeshStandardMaterial({ color: 0x00ff72 });

    const columnShape = new Cylinder(0.5, 0.5, 3, 5);

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
        body,
        update() {
            bottom.quaternion.copy(body.quaternion);
        }
    }

}


