/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-07 17:09:45
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-13 14:42:21
 * @FilePath: \threejs-demo\src\animate\characterControl.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */


import {
    Vector3,
    AnimationMixer,
    Matrix4,
    Quaternion,
} from "three";
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initDirectionLight,
    Model_Path,
    initClock,
    initAmbientLight,
    initLoader,
    initGroundPlane,
    HALF_PI,
    initViewHelper,
    resize,
    initGUI,
} from "../lib/tools/index.js";
import {
    World,
    Body,
    NaiveBroadphase,
    Box as BoxShape,
    Vec3,
    Material,
    Quaternion as QuaternionPsy,
    ContactMaterial
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
    renderer.autoClear = false;

    const camera = initOrthographicCamera(new Vector3(-100, 100, 0));
    camera.zoom = 0.1;
    camera.updateProjectionMatrix();

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
        material: new Material()
    });

    groundBody.addShape(new BoxShape(new Vec3(100, 1, 100)), new Vec3(0, -1, 0));
    groundBody.name = 'groundBody';
    world.addBody(groundBody);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const debug = CannonDebugger(scene, world);
    debug.visible = false;

    const character = await createCharacter();

    const contactMaterial = new ContactMaterial(groundBody.material, character.body.material, { friction: 0.05, restitution: 0.1 });
    world.addContactMaterial(contactMaterial);

    const viewHelper = initViewHelper(camera, renderer.domElement);
    viewHelper.center.copy(orbitControls.target)

    scene.add(character.model);
    world.addBody(character.body);

    window.addEventListener('keydown', (event) => {
        character.keyDown(keyMap[event.key.toLowerCase()]);
    });

    window.addEventListener('keyup', (event) => {
        character.keyUp(keyMap[event.key.toLowerCase()]);
    });

    resize(renderer, camera);

    const clock = initClock();
    const timeStep = 1 / 60;
    let delta = 0;
    function render() {
        renderer.clear();
        delta = clock.getDelta();
        world.step(timeStep, delta, 5);
        orbitControls.update();
        renderer.render(scene, camera);
        debug.update();
        character.update(delta);
        viewHelper.render(renderer);
        requestAnimationFrame(render);
    }
    render();

    const gui = initGUI();
    gui.add(world.gravity, 'y', -200, 200, 10).name('Gravity');
    gui.add(contactMaterial, 'friction', 0, 1, 0.1).name('Friction');
    gui.add(contactMaterial, 'restitution', 0, 1, 0.1).name('Restitution');
    gui.add(debug, 'visible').name('Debug');
    gui.save();
    gui.add({
        reset() {
            gui.reset();
            character.reset();
        }
    }, 'reset');
}

async function createCharacter() {
    const model = (await loader.loadAsync(`../../${Model_Path}/character/character.glb`)).scene;
    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    })
    const idleClip = (await loader.loadAsync(`../../${Model_Path}/character/character-idle.fbx`)).animations[0];
    const walkClip = (await loader.loadAsync(`../../${Model_Path}/character/character-walk.fbx`)).animations[0];
    const jumpClip = (await loader.loadAsync(`../../${Model_Path}/character/character-jump.fbx`)).animations[0];
    const runClip = (await loader.loadAsync(`../../${Model_Path}/character/character-running.fbx`)).animations[0];
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
    const velocity = 50;
    let currentVelocity = 0;


    const body = new Body({
        mass: 80,
        material: new Material()
    })
    body.addShape(new BoxShape(new Vec3(3.5, 9.3, 4)), new Vec3(0, 9.3, 0));
    body.name = 'character';
    // 修改模型初始方向
    const primaryQ = new QuaternionPsy().setFromAxisAngle(new Vec3(0, 1, 0), HALF_PI);

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

        if (keyPressed.w) direction.x += 1;
        if (keyPressed.s) direction.x -= 1;
        if (keyPressed.a) direction.z -= 1;
        if (keyPressed.d) direction.z += 1;

        direction.normalize();
    }

    function updateCharacter() {
        if (direction.lengthSq() > 0) {
            if (isWalking) {
                currentVelocity = velocity;
            } else if (isRunning) {
                if (isJumping) {
                    currentVelocity = velocity * 0.5;
                } else {
                    currentVelocity = velocity * 1.3;
                }
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

    function reset() {
        body.quaternion.copy(primaryQ);
        body.position.set(0, 0, 0);
        body.velocity.set(0, 0, 0);
    }

    reset();

    return {
        model,
        body,
        keyDown,
        keyUp,
        update,
        reset
    }
}

