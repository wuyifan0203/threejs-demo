/* eslint-disable camelcase */
/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-28 17:51:26
 * @FilePath: /threejs-demo/src/cannon/force.js
 */
import {
    Mesh,
    Clock,
    SphereGeometry,
    Vector3,
    TorusGeometry,
    Group,
    CylinderGeometry,
    MeshStandardMaterial
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
    World, Body, Material, ContactMaterial, Plane, NaiveBroadphase, Cylinder, Vec3
} from '../lib/other/physijs/cannon.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();

    initGroundPlane(scene);
    initAmbientLight(scene);

    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const group = new Group();
    const cylinder = new CylinderGeometry(1, 1, 1, 32);
    cylinder.rotateX(Math.PI / 2);
    // 圆台
    const bottomMaterial = new MeshStandardMaterial({ color: 0x00ff00 });
    const bottom = new Mesh(cylinder, bottomMaterial);
    bottom.scale.set(5, 5, 1);
    bottom.position.set(0, 0, 0.5);
    bottom.castShadow = bottom.receiveShadow = true;
    group.add(bottom);

    const columnMaterial = new MeshStandardMaterial({ color: 0x0000ff });
    const columnNumber = 5;
    const pice = Math.PI * 2 / columnNumber;
    for (let index = 0; index < columnNumber; index++) {
        const column = new Mesh(cylinder, columnMaterial);
        column.scale.set(0.5, 0.5, 3);
        column.position.x = 4 * Math.cos(pice * index);
        column.position.y = 4 * Math.sin(pice * index);
        column.position.z = 2.5;
        column.castShadow = true;
        group.add(column);
    }

    scene.add(group);

    // 小环
    const circle = new TorusGeometry(2, 0.1, 16, 16);
    const circleMaterial = new MeshStandardMaterial({ color: 0xff0000 });
    const circleMesh = new Mesh(circle, circleMaterial);

    circleMesh.position.z = 2.5;
    circleMesh.castShadow = true;
    scene.add(circleMesh);

    // cannon

    const plasticMaterial = new Material('plastic');
    plasticMaterial.friction = 0.2;
    plasticMaterial.restitution = 0.8;

    const world = new World({ gravity: new Vec3(0, 0, -9.82) });

    const groundShape = new Plane();
    const groundBody = new Body({ mass: 0, shape: groundShape, material: plasticMaterial });
    world.addBody(groundBody);

    const bottomShape = new Cylinder(5, 5, 1, 32);
    const bottomBody = new Body({ mass: 1, shape: bottomShape, material: plasticMaterial });
    world.addBody(bottomBody);

    const columnShape = new Cylinder(0.5, 0.5, 3, 32);
    const columnBodies = [];
    for (let index = 0; index < columnNumber; index++) {
        const columnBody = new Body({ mass: 1, shape: columnShape, material: plasticMaterial });
        columnBody.position.copy(group.children[index].position);
        world.addBody(columnBody);
        columnBodies.push(columnBody);
    }

    const circleBody = new Body({ mass: 0.2, material: plasticMaterial });
    const radius = 4;
    const piceCircle = 8;
    // c = 2 * Pi * R
    // h = c / pice
    // R = 4 ,pice = 8
    const height = 2 * Math.PI * radius / piceCircle;
    for (let index = 0; index < piceCircle; index++) {
        const partShape = new Cylinder(0.2, 0.2, height);
        partShape.

    }





    const clock = new Clock();
    function render() {
        const t = clock.getDelta();
        orbitControl.update();
        group.rotation.z = group.rotation.z + t;
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();


}
