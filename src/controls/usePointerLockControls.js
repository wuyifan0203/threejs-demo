/*
 * @Date: 2023-12-25 10:46:48
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-29 20:58:13
 * @FilePath: /threejs-demo/src/controls/usePointerLockControls.js
 */
import {
    Vector3,
    Mesh,
    MeshNormalMaterial,
    BoxGeometry,
    Raycaster,
    SphereGeometry
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initScene,
    initGUI,
    initPerspectiveCamera
} from '../lib/tools/index.js';
// import { PointerLockControls } from '../lib/three/PointerLockControls.js';
import { PointerLockControls } from './PointerLockControls.js';

window.onload = () => {
    init();
};

function init() {
    const introductionDOM = document.getElementById('introduction');
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(0, -10, 1));
    const scene = initScene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);
    initCustomGrid(scene);
    initAxesHelper(scene);

    const controls = new PointerLockControls(camera, document.body);

    controls.addEventListener('lock', () => {
        introductionDOM.style.display = 'none';
        controls.connect()
        console.log('controls was locked');
        console.log('controls.isLocked:', controls.isLocked);
    });

    controls.addEventListener('unlock', () => {
        introductionDOM.style.display = 'block';
        controls.disconnect()
        console.log('controls was unlock');
        console.log('controls.isLocked:', controls.isLocked);
    })
    let jumping = false

    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyP':
                controls.lock();
                break;
            case 'Escape':
                controls.unlock();
                break;
            case 'Space':
                if (!jumping) {
                    jumping = true;
                    velocity.z = 10;
                }
                break;
            case 'KeyW':
                velocity.y = 3;
                break;
            case 'KeyS':
                velocity.y = -3;
                break;
            case 'KeyA':
                velocity.x = -3;
                break;
            case 'KeyD':
                velocity.x = 3;
                break;
            default:
                break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW':
                velocity.y = 0;
                break;
            case 'KeyS':
                velocity.y = 0;
                break;
            case 'KeyA':
                velocity.x = 0;
                break;
            case 'KeyD':
                velocity.x = 0;
                break;
            default:
                break;
        }
    })

    scene.add(camera); // scene.add(controls.getObject())

    const velocity = new Vector3(0, 0, 0);
    let debug = true;
    const debugCamera = initPerspectiveCamera();
    debugCamera.up.set(0, 0, 1);
    const debugLookAt = new Vector3();

    let lastTime = 0;
    renderer.setAnimationLoop(render);
    function render(dt) {
        const deltaTime = (dt - lastTime) / 1000;
        lastTime = dt;
        renderer.clear();
        updateCameraPosition(deltaTime);
        renderer.render(scene, debug ? debugCamera : camera);
    }

    const raycast = new Raycaster(camera.position, new Vector3(0, 0, -1));
    raycast.intersectObject()

    function updateCameraPosition(dt) {
        controls.moveForward(dt * velocity.y);
        controls.moveRight(dt * velocity.x);

        if (jumping) {
            // nv = V0 -g * t;
            const nv = velocity.z - 9.8 * dt;
            // dz = dt * V平均;
            const dz = dt * (velocity.z + nv) / 2;
            velocity.z = nv;
            camera.position.z += dz;
            if (camera.position.z < 1) {
                camera.position.z = 1;
                velocity.z = 0;
                jumping = false;
            }
        }

        if (debug) {
            debugLookAt.setFromMatrixPosition(camera.matrixWorldInverse)
            debugCamera.position.copy(camera.position).sub(new Vector3(0, 5, 0));
            debugCamera.lookAt(debugLookAt);
            debugCamera.updateProjectionMatrix();
            debugCamera.updateMatrixWorld();
        }
    }

    const sphereMesh = new Mesh(new SphereGeometry(1, 32, 32), new MeshNormalMaterial());
    camera.add(sphereMesh);

    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshNormalMaterial({});

    const mesh = new Mesh(geometry, material);

    const mesh1 = new Mesh(geometry, material);
    mesh1.position.set(2, 2, 0)

    scene.add(mesh, mesh1);

    const gui = initGUI();

}
