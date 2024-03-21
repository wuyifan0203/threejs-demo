/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-21 11:09:02
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-21 16:53:16
 * @FilePath: /threejs-demo/src/cannon/bowling.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector2,
    SphereGeometry, QuadraticBezierCurve,
    Vector3,
    MeshPhongMaterial,
    SplineCurve,
    LatheGeometry,
    ShaderMaterial,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initSpotLight,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initPerspectiveCamera,
    initDirectionLight,
    initCoordinates
} from '../lib/tools/index.js';
import {
    World, Vec3, Body, Material, ContactMaterial, Plane, NaiveBroadphase, ConvexPolyhedron,
} from '../lib/other/physijs/cannon.js';

import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});

    const camera = initPerspectiveCamera(new Vector3(-0, 0, 50));
    camera.updateProjectionMatrix();

    const scene = initScene();

    initAmbientLight(scene);

    // cannon
    const world = new World();
    world.gravity.set(0, -9.82, 0);

    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    scene.add(initCoordinates(16));


    createBottles(scene, world);


    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    function update() {
        orbitControl.update();
        cannonDebugger.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(update);




}

function initPosition(radius, offset = new Vector3(0, 0, 0)) {
    const sr = Math.sqrt(3) * radius;
    const positions = [
        new Vector3(0, 0, 0),
        new Vector3(-radius, 0, sr),
        new Vector3(radius, 0, sr),
        new Vector3(-radius * 2, 0, sr * 2),
        new Vector3(0, 0, sr * 2),
        new Vector3(radius * 2, 0, sr * 2),
        new Vector3(-radius * 3, 0, sr * 3),
        new Vector3(-radius, 0, sr * 3),
        new Vector3(radius, 0, sr * 3),
        new Vector3(radius * 3, 0, sr * 3),
    ];
    return positions.map(v => v.add(offset));
}

function createBottles(scene, world) {
    const line = new SplineCurve([
        new Vector2(2, 0),
        new Vector2(2.4, 6),
        new Vector2(2.3, 8),
        new Vector2(0.8, 10),
    ]);

    const line2 = new SplineCurve([
        new Vector2(0.8, 13),
        new Vector2(0.5, 13.5),
        new Vector2(0, 13.8),
    ]);

    const points = [
        new Vector2(0, 0),
        ...line.getPoints(20),
        new Vector2(0.8, 13),
        ...line2.getPoints(5),
    ];

    const geometry = new LatheGeometry(points, 16);
    const material = new ShaderMaterial({
        vertexShader: /*glsl*/`
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main() {
                vNormal = normal;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader:/*glsl*/ `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
            //光线向量
            vec3 light = vec3(40.0, 40.0, 70.0);
            float y = vPosition.y;
            float c = 0.4 * pow( dot(light, vNormal) / length(light), 2.0);
            float withinRange = step(10.2, y) * step(y, 10.8) + step(11.1, y) * step(y, 11.7);

            vec3 color = vec3(1.0, c, c) * withinRange + vec3(c + 0.6) * (1.0 - withinRange);
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    });

    const positions = initPosition(2.5, new Vector3(0, 0, 0));

    const vertices = [];
    const faces = [];
    const positionBuffer = geometry.getAttribute('position').array;
    const indexBuffer = geometry.getIndex().array;

    for (let j = 0, k = positionBuffer.length; j < k; j += 3) {
        const x = positionBuffer[j];
        const y = positionBuffer[j + 1];
        const z = positionBuffer[j + 2];
        vertices.push(new Vec3(x, y, z));
    }

    for (let j = 0, k = indexBuffer.length; j < k; j += 3) {
        const x = indexBuffer[j];
        const y = indexBuffer[j + 1];
        const z = indexBuffer[j + 2];
        faces.push([x, y, z]);
    }

    const bottleShape = new ConvexPolyhedron({ vertices, faces });

    const bottlePhysicsMaterial = new Material('bottle');

    const bottleMeshes = [];
    const bottleBodies = [];

    positions.forEach((pos) => {
        const mesh = new Mesh(geometry, material);
        mesh.position.copy(pos);
        bottleMeshes.push(mesh);
        scene.add(mesh);

        const body = new Body({ mass: 1, material: bottlePhysicsMaterial, shape: bottleShape });
        body.position.copy(pos);
        bottleBodies.push(body);
        world.addBody(body);
    })

    return { bottleMeshes, bottleBodies };

}
