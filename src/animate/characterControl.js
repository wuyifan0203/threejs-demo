/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-07 17:09:45
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-12 18:33:41
 * @FilePath: \threejs-demo\src\animate\characterControl.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */


import {
    Vector3,
    AnimationMixer,
    Matrix4,
    Quaternion,
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
    ' ': 'space',
    shift: 'shift'
};

async function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(-100, 100, 0));

    const scene = initScene();

    initAmbientLight(scene);

    const light = initDirectionLight();
    light.shadow.camera.left = -150;
    light.shadow.camera.right = 150;
    light.shadow.camera.bottom = -150;
    light.shadow.camera.top = 150;
    light.shadow.camera.far = 250;
    light.position.set(70, 70, 70);
    scene.add(light);

    const world = new World();
    world.gravity.set(0, -100, 0);
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
        world.step(timeStep, delta, 5);
        orbitControls.update();
        renderer.render(scene, camera);
        debug.update();
        character.update(delta);
        requestAnimationFrame(render);
    }
    render();
}

async function createCharacter() {
    const model = (await loader.loadAsync(`../../${modelPath}/character/character.glb`)).scene;
    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    })
    const idleClip = (await loader.loadAsync(`../../${modelPath}/character/character-idle.fbx`)).animations[0];
    const walkClip = (await loader.loadAsync(`../../${modelPath}/character/character-walk.fbx`)).animations[0];
    const jumpClip = (await loader.loadAsync(`../../${modelPath}/character/character-jump.fbx`)).animations[0];
    const runClip = (await loader.loadAsync(`../../${modelPath}/character/character-running.fbx`)).animations[0];
    // 清楚原始动画的位移
    runClip.tracks.shift();

    const mixer = new AnimationMixer(model);

    const actionMap = {
        idle: mixer.clipAction(idleClip),
        walk: mixer.clipAction(walkClip),
        jump: mixer.clipAction(jumpClip),
        run: mixer.clipAction(runClip)
    }
    let currentAction = actionMap.idle;
    currentAction.play();
    let nextAction = null;
    let isWalking = false;
    let isJumping = false;
    let isRunning = false;
    const force = new Vector3();
    const zero = new Vector3();
    const rotateMatrix = new Matrix4();
    const targetQuaternion = new Quaternion();
    const targetQuaternionPsy = new QuaternionPsy();
    const velocity = 40;
    let currentVelocity = 0;


    const body = new Body({
        mass: 100,
        material: new Material(),
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

    // 记录按下方向键的数量
    let count = 0;

    function keyDown(key) {
        keyPressed[key] = true;
        if (keyPressed.space) {
            body.velocity.y = 40;
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
            if (keyPressed.shift) {
                isWalking = false;
                if (keyPressed.w || keyPressed.a || keyPressed.s || keyPressed.d) {
                    nextAction = actionMap.run;
                    isRunning = true;
                }
            } else {
                isRunning = false;
                if (keyPressed.w || keyPressed.a || keyPressed.s || keyPressed.d) {
                    nextAction = actionMap.walk;
                    isWalking = true;
                } else {
                    nextAction = actionMap.idle;
                    isWalking = false;
                }
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
        count = 0;

        if (keyPressed.w) {
            direction.x += 1;
            count++;
        }
        if (keyPressed.s) {
            direction.x -= 1;
            count++;
        }
        if (keyPressed.a) {
            direction.z -= 1;
            count++;
        }
        if (keyPressed.d) {
            direction.z += 1;
            count++;
        }

        if (count > 1) {
            // 如果按下两个方向键，速度应该扩大原来的 √2，以保持整体速度恒定
            direction.normalize().multiplyScalar(Math.SQRT2);
        } else if (count === 1) {
            direction.normalize();
        }
    }

    function updateCharacter() {
        if (direction.lengthSq() > 0) {
            if (isWalking) {
                currentVelocity = velocity;
            } else if (isRunning) {
                currentVelocity = velocity * 1.5;
            }
            force.copy(direction).multiplyScalar(currentVelocity);
            rotateMatrix.lookAt(direction, zero, model.up);
            targetQuaternion.setFromRotationMatrix(rotateMatrix);
            targetQuaternionPsy.copy(targetQuaternion);

            body.quaternion.slerp(targetQuaternionPsy, 0.5, body.quaternion);
            body.velocity.set(force.x, body.velocity.y, force.z);
        } else {
            body.velocity.set(0, body.velocity.y, 0);
        }

        if (Math.abs(body.velocity.y) < 0.1) {
            body.velocity.y = 0;
            isJumping = false;
        }

        model.position.copy(body.position);
        model.quaternion.copy(body.quaternion);
    }

    return {
        model,
        body,
        keyDown,
        keyUp,
        update
    }
}

