/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-02-26 17:36:05
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-02-28 19:09:25
 * @FilePath: \threejs-demo\src\cannon\breaker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    Vector2,
    MeshStandardMaterial,
    Vector3,
    SphereGeometry,
    MeshPhysicalMaterial,
    Raycaster,
} from 'three';
import {
    initRenderer,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    initAmbientLight,
    initDirectionLight,
    initClock,
    initPerspectiveCamera
} from '../lib/tools/index.js';
import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker.js';
import { World, Body, Box as BoxShape, Vec3, Sphere, Material, ContactMaterial, ConvexPolyhedron, Quaternion } from '../lib/other/physijs/cannon-es.js';

import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js';
import { CannonUtils } from '../lib/other/physijs/cannon-utils.js';
import { update } from 'three/examples/jsm/libs/tween.module.js';

window.onload = () => {
    init();
};
function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(20, 18, 10));

    const controls = initOrbitControls(camera, renderer.domElement);

    const scene = initScene();
    const light = initDirectionLight();
    light.position.set(0, 100, 150);
    scene.add(light);
    initAmbientLight(scene);
    initAxesHelper(scene);

    const direction = new Vector3();
    const position = new Vector3();
    const normal = new Vector3();
    const collidePosition = new Vector3();
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    const balls = [];
    const wallFragments = [];
    const sphereVelocity = 40;

    const world = new World({ gravity: new Vec3(0, -10, 0) });
    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    const cob = new ConvexObjectBreaker();

    const ground = createGround(scene, world);

    const wall = createWall(scene, world);
    wall.prepareBreak(cob);

    world.addContactMaterial(new ContactMaterial(wallPhysicMaterial, ballPhysicMaterial, { friction: 0.5, restitution: 0.3 }));
    // world.addContactMaterial(new ContactMaterial(ground.body.material, wallPhysicMaterial, { friction: 0.5, restitution: 0.3 }));
    world.addContactMaterial(new ContactMaterial(ground.body.material, ballPhysicMaterial, { friction: 0.2, restitution: 0.5 }));

    window.addEventListener('click', ({ clientX, clientY }) => {
        pointer.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const ball = createBall(scene, world);
        position.copy(raycaster.ray.direction).add(raycaster.ray.origin);
        console.log('position: ', position);
        ball.body.position.copy(position);
        const velocity = direction.copy(raycaster.ray.direction).multiplyScalar(sphereVelocity);
        ball.body.velocity.copy(velocity);
        balls.push(ball);

        ball.body.addEventListener('collide', ({ body, contact, target }) => {
            console.log('e: ', body, contact, target);
            if (body.typeName === 'Wall') {
                collidePosition.copy(body.pointToLocalFrame(contact.bj.position).vadd(contact.rj));
                normal.set(contact.ni.x, contact.ni.y, contact.ni.z).negate();

                const fragments = cob.subdivideByImpact(wall.mesh, position, normal, 1, 1);

                fragments.forEach((mesh) => {
                    const fragment = createWallFragment(scene, world, mesh);
                    wallFragments.push(fragment);
                })


                wall.dispose();

                console.log('fragments: ', fragments);
            }

            // const position = e, body.

        })
    })

    function updatePhysicsWorld() {
        world.step(fps, clock.getDelta());
        controls.update();
        wall.update();

        for (let i = balls.length - 1; i >= 0; i--) {
            const ball = balls[i];
            ball.update();

            if (ball.mesh.position.y < -100) {
                console.log('ball out of world');
                ball.dispose();
                balls.splice(i, 1); // 直接按当前索引删除
            }
        }

        cannonDebugger.update();
    }

    const fps = 1 / 60;
    const clock = initClock();
    function render() {
        updatePhysicsWorld();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);
}

function createGround(scene, world) {
    const size = new Vector3(100, 0.5, 100);
    const halfSize = size.clone().multiplyScalar(0.5);

    const mesh = new Mesh(new BoxGeometry(size.x, size.y, size.z), new MeshStandardMaterial({ color: 'gray' }));
    mesh.receiveShadow = true;
    scene.add(mesh);

    const body = new Body({
        shape: new BoxShape(halfSize),
        mass: 0,
        material: new Material()
    })

    body.typeName = 'Ground';
    body.mesh = mesh;

    world.addBody(body);
    return {
        mesh,
        body
    }
}

const glassMaterial = new MeshPhysicalMaterial({
    roughness: 0.6,
    transmission: 1,
    thickness: 1.2,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    clearcoatNormalScale: new Vector2(0.3, 0.3),
    // color: 'blue'
});
const size = new Vector3(8, 10, 2);
const halfSize = size.clone().multiplyScalar(0.5);
const wallGeometry = new BoxGeometry(size.x, size.y, size.z);

const wallShape = new BoxShape(halfSize);
const wallPhysicMaterial = new Material({
    restitution: 0.5,
    friction: 0.8
})
function createWall(scene, world) {
    const mesh = new Mesh(wallGeometry, glassMaterial);
    mesh.castShadow = true;
    mesh.position.set(0, 10, 0);
    scene.add(mesh);

    const body = new Body({
        shape: wallShape,
        mass: 1,
        position: new Vec3().copy(mesh.position),
        material: wallPhysicMaterial,
    })

    world.addBody(body);

    body.typeName = 'Wall';
    body.mesh = mesh;

    return {
        mesh,
        body,
        update() {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        dispose() {
            scene.remove(mesh);
            world.removeBody(body);
        },
        prepareBreak(breaker) {
            breaker.prepareBreakableObject(mesh, body.mass, new Vector3(), new Vector3(), true)
        }
    }
}


const sphereGeometry = new SphereGeometry(1, 64, 64);

const ballPhysicMaterial = new Material({
    restitution: 0.5,
    friction: 0.8
})
function createBall(scene, world) {
    const mesh = new Mesh(sphereGeometry, glassMaterial);
    mesh.castShadow = true;
    scene.add(mesh);

    const body = new Body({
        mass: 1,
        shape: new Sphere(1),
        material: ballPhysicMaterial,
    })

    world.addBody(body);

    body.typeName = 'Ball';
    body.mesh = mesh;

    return {
        mesh,
        body,
        update() {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        dispose() {
            scene.remove(mesh);
            world.removeBody(body);
        }
    }
}

function createWallFragment(scene, world, mesh) {
    console.log('mesh: ', mesh);
    scene.add(mesh);

    const shape = CannonUtils.geometry2Shape(mesh.geometry);
    console.log('shape: ', shape);

    const body = new Body({
        mass: mesh.userData.mass,
    })
    body.addShape(shape[0].shape, new Vec3().copy(mesh.position), new Quaternion().copy(mesh.quaternion));

    world.addBody(body);

    return {
        update(){
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        },
        dispose() {
            scene.remove(mesh);
            world.removeBody(body);
        },
        prepareBreak(breaker) {
            breaker.prepareBreakableObject(mesh, body.mass, new Vector3(), new Vector3(), true)
        }
    }
}