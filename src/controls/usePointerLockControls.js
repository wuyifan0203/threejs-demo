/*
 * @Date: 2023-12-25 10:46:48
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:41:12
 * @FilePath: /threejs-demo/src/controls/usePointerLockControls.js
 */
import {
    Vector3,
    Mesh,
    MeshNormalMaterial,
    BoxGeometry,
    Raycaster,
    SphereGeometry,
    MeshBasicMaterial
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initScene,
    initGUI,
    initPerspectiveCamera,
    rainbowColors
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

    const geometry = new BoxGeometry(4, 4, 4);

    const materialPool = rainbowColors.map(c=>new MeshBasicMaterial({color: c}))

    const meshes = [];
    for (let j = 0; j < 30; j++) {
        const mesh = new Mesh(geometry, materialPool[j % materialPool.length]);
        mesh.position.set(0, j * 2, j * 2);
        meshes.push(mesh);
        scene.add(mesh);
    }
    const controls = new PointerLockControls(camera, document.body);

    controls.addEventListener('lock', () => {
        introductionDOM.style.display = 'none';
        console.log('controls was locked');
        console.log('controls.isLocked:', controls.isLocked);
    });

    controls.addEventListener('unlock', () => {
        introductionDOM.style.display = 'block';
        console.log('controls was unlock');
        console.log('controls.isLocked:', controls.isLocked);
    })
    let jumping = false

    introductionDOM.addEventListener('click', () => controls.lock());

    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyB':
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

    let lastTime = 0;
    (function render(dt) {
        const deltaTime = (dt - lastTime) / 1000;
        lastTime = dt;
        renderer.clear();
        if (controls.isLocked) {
            updateCameraPosition(deltaTime);
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    })()

    const raycast = new Raycaster(camera.position, new Vector3(0, 0, -1));

    const intersects = []


    function updateCameraPosition(dt) {
        controls.moveForward(dt * velocity.y);
        controls.moveRight(dt * velocity.x);

        intersects.length = 0;
        raycast.intersectObjects(meshes, false, intersects)

        if (jumping) {
            // nv = V0 -g * t;
            const nv = velocity.z - 9.8 * dt;
            // dz = dt * V平均;
            const dz = dt * (velocity.z + nv) / 2;
            velocity.z = nv;
            camera.position.z += dz;
            if (camera.position.z < 1 && !intersects.length) {
                camera.position.z = 1;
                velocity.z = 0;
                jumping = false;
            } else if (intersects.length) {
                const object = intersects[0].object;
                const currentMaxHeight = object.position.z + object.geometry.parameters.height / 2 + 1;
                if (camera.position.z < currentMaxHeight) {
                    camera.position.z = currentMaxHeight;
                    velocity.z = 0;
                    jumping = false;
                }
            }
        } else {
            if (camera.position.z > 1 && !intersects.length) {
                const nv = velocity.z - 9.8 * dt;
                const dz = dt * (velocity.z + nv) / 2;
                velocity.z = nv;
                camera.position.z += dz;
                if (camera.position.z < 1) {
                    camera.position.z = 1;
                    velocity.z = 0;
                }
            }else if(intersects.length){
                const object = intersects[0].object;
                const currentMaxHeight = object.position.z + object.geometry.parameters.height / 2 + 1;
                const nv = velocity.z - 9.8 * dt;
                const dz = dt * (velocity.z + nv) / 2;
                velocity.z = nv;
                camera.position.z += dz;
                if (camera.position.z < currentMaxHeight) {
                    camera.position.z = currentMaxHeight;
                    velocity.z = 0;
                    jumping = false;
                }
            }
        }

    }

    const sphereMesh = new Mesh(new SphereGeometry(1, 32, 32), new MeshNormalMaterial());
    camera.add(sphereMesh);



    const gui = initGUI();

}
