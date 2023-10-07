/*
 * @Date: 2023-09-06 10:24:49
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 00:51:22
 * @FilePath: /threejs-demo/apps/snake/index.js
 */
import {
    BoxGeometry, Clock, Mesh, Vector3, MeshBasicMaterial
} from '../../examples/src/lib/three/three.module.js';
import {
    initRenderer,
    initScene,
    initPerspectiveCamera,
    initAxesHelper,
    initCustomGrid,
    initOrbitControls,
    initCoordinates
} from '../../examples/src/lib/tools/index.js';
import { Snake } from './snake.js'

window.onload = function () {
    init();
}

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(0, -10, 10));
    camera.up.set(0, 0, 1);
    const scene = initScene();
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    initAxesHelper(scene);

    const controls = new initOrbitControls(camera, renderer.domElement);

    const speed = 3

    const clock = new Clock();

    const coord = initCoordinates(3);

    const snake = new Snake();

    snake.head.main.add(coord);
    scene.add(snake.head.main);
    let defaultDirection = 'PosX';

    snake.grow()
    snake.grow()

    function render(t) {
        const delta = clock.getDelta();
        // snake.update(defaultDirection, delta);

        controls.update();
        renderer.render(scene, camera);
    }
       snake.update(defaultDirection, 1);

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            if (defaultDirection !== 'PosY') {
                defaultDirection = 'PosY';
            }
        } else if (e.code === 'KeyA') {
            if (defaultDirection !== 'NegX') {
                defaultDirection = 'NegX';
            }
        }
        else if (e.code === 'KeyS') {
            if (defaultDirection !== 'NegY') {
                defaultDirection = 'NegY';
            }
        }
        else if (e.code === 'KeyD') {
            if (defaultDirection !== 'PosX') {
                defaultDirection = 'PosX';
            }
        }
    })

    renderer.setAnimationLoop(render);

    window.scene = scene;
}
