/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-07 17:09:45
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-11 17:52:06
 * @FilePath: \threejs-demo\src\animate\characterControl.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */


import {
    Vector3,
    AnimationMixer,
    Matrix4,
    Quaternion,
    Box3,
    BoxHelper,
    Box3Helper,
} from "../lib/three/three.module.js";
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initDirectionLight,
    modelPath,
    initClock,
    initAmbientLight,
    initLoader,
    initGroundPlane,
    HALF_PI,
} from "../lib/tools/index.js";
import {
    World,
    Body,
    NaiveBroadphase,
    Box as BoxShape,
    Vec3,
    Material,
    Quaternion as QuaternionPsy,
} from '../lib/other/physijs/cannon-es.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

const loader = initLoader();

window.onload = function () {
    init();
};

const keyMap = {
    w: 'w',
    a: 'a',
    s: 's',
    d: 'd',
    ' ': 'space'
};

async function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));

    const scene = initScene();

    initAmbientLight(scene);

    const light = initDirectionLight();
    light.position.set(70, 70, 70);
    scene.add(light);

    const world = new World();
    world.gravity.set(0, -9.8, 0);
    world.broadphase = new NaiveBroadphase();
    world.solver.iterations = 5;
    world.solver.tolerance = 0.001;

    const ground = initGroundPlane(scene);
    ground.rotateX(-HALF_PI);
    const groundBody = new Body({
        mass: 0,
        material: new Material({ friction: 0.5, restitution: 0.5 })
    });

    groundBody.addShape(new BoxShape(new Vec3(100, 1, 100)), new Vec3(0, -1, 0));
    groundBody.name = 'groundBody';
    world.addBody(groundBody);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const debug = CannonDebugger(scene, world)

    const character = await createCharacter();

    scene.add(character.model);
    world.addBody(character.body);

    window.addEventListener('keydown', (event) => {
        character.keyDown(keyMap[event.key.toLowerCase()]);
    });

    window.addEventListener('keyup', (event) => {
        character.keyUp(keyMap[event.key.toLowerCase()]);
    });


    const clock = initClock();
    const timeStep = 1 / 60;
    let delta = 0;
    function render() {
        delta = clock.getDelta();
        world.step(timeStep, delta, 3);
        orbitControls.update();
        renderer.render(scene, camera);
        debug.update();
        character.update(delta);
        requestAnimationFrame(render);
    }
    render();
}

async function createCharacter(groundBody) {
    const model = (await loader.loadAsync(`../../${modelPath}/character/character.glb`)).scene;

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    })
    const idleClip = (await loader.loadAsync(`../../${modelPath}/character/character-idle.fbx`)).animations[0];
    const walkClip = (await loader.loadAsync(`../../${modelPath}/character/character-walk.fbx`)).animations[0];
    const jumpClip = (await loader.loadAsync(`../../${modelPath}/character/character-jump.fbx`)).animations[0];

    const mixer = new AnimationMixer(model);

    const actionMap = {
        idle: mixer.clipAction(idleClip),
        walk: mixer.clipAction(walkClip),
        jump: mixer.clipAction(jumpClip)
    }
    let currentAction = actionMap.idle;
    currentAction.play();
    let nextAction = null;
    let isWalking = false;
    let isJumping = false;
    const force = new Vector3();
    const zero = new Vector3();
    const rotateMatrix = new Matrix4();
    const targetQuaternion = new Quaternion();
    const targetQuaternionPsy = new QuaternionPsy();
    const speed = 24;



    const body = new Body({
        mass: 1,
        material: new Material({ friction: 0.5, restitution: 0.5 }),
    })
    body.addShape(new BoxShape(new Vec3(3.5, 9.3, 4)), new Vec3(0, 9.3, 0));
    body.name = 'character';

    const direction = new Vector3();

    const keyPressed = {
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
        shift: false
    };

    function keyDown(key) {
        keyPressed[key] = true;
        if (keyPressed.space) {
            body.velocity.y = 5;
            isJumping = true;
        }
    }

    function keyUp(key) {
        keyPressed[key] = false;
    }

    function update(delta) {
        updateAction(delta);
        updateDirection();
        updateCharacter(delta);
    }

    function updateAction(dt) {
        mixer.update(dt);
        if (isJumping) {
            nextAction = actionMap.jump;
        } else {
            if (keyPressed.w || keyPressed.a || keyPressed.s || keyPressed.d) {
                nextAction = actionMap.walk;
                isWalking = true;
            } else {
                nextAction = actionMap.idle;
                isWalking = false;
            }
        }

        if (currentAction !== nextAction) {
            currentAction.fadeOut(0.5);
            nextAction.reset().fadeIn(0.5).play();
            currentAction = nextAction;
        }
    }

    function updateDirection() {
        direction.set(0, 0, 0);

        if (keyPressed.w) direction.x += 1;
        if (keyPressed.s) direction.x -= 1;
        if (keyPressed.a) direction.z -= 1;
        if (keyPressed.d) direction.z += 1;

        direction.normalize();
    }

    function updateCharacter() {
        if (isWalking && direction.lengthSq() > 0) {
            force.copy(direction).multiplyScalar(speed);
            rotateMatrix.lookAt(direction, zero, model.up);
            targetQuaternion.setFromRotationMatrix(rotateMatrix);
            targetQuaternionPsy.copy(targetQuaternion);

            body.quaternion.slerp(targetQuaternionPsy, 0.5, body.quaternion);
            body.velocity.set(force.x, 0, force.z);
        } else {
            body.velocity.set(0, 0, 0);
        }

        model.position.copy(body.position);
        model.quaternion.copy(body.quaternion);
    }

    body.addEventListener('collide', ({ body }) => {
        if(body === groundBody){
            isJumping = false;
        }
    })


    return {
        model,
        body,
        keyDown,
        keyUp,
        update
    }
}

