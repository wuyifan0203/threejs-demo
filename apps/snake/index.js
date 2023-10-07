/*
 * @Date: 2023-09-06 10:24:49
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-07 20:19:41
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

    const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }));

    scene.add(mesh);

    const coord = initCoordinates(3);

    mesh.add(coord);

    function render(t) {
        const delta = clock.getDelta();
        // mesh.translateX(delta * speed)
        controls.update();
        renderer.render(scene, camera);
    }

    let defaultDirection = 0;
    
    const directionMap = {
        0:'X',
        1:'Y',
        2:'-X',
        3:'-Y'
    }
    
    const HP = Math.PI/2;
    const P = Math.PI;

    const xAngleMap = {
        1:-HP,
        2:P,
        3:HP
    }

    const yAngleMap = {
        0:HP,
        2:-HP,
        3:P
    }
    const negXAngleMap = {
        0:P,
        1:HP,
        3:-HP
    }

    const negYAngleMap = {
        0:-HP,
        1:P,
        2:HP,
    }
    const child = mesh.clone();
    child.position.set(-1, 0, 0);
    mesh.add(child)

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            if(defaultDirection !== 1){
                defaultDirection = 1;
            }
        } else if (e.code === 'KeyA') {
            if(defaultDirection !== 2){
                defaultDirection = 2;
            }
        }
        else if (e.code === 'KeyS') {
            if(defaultDirection !== 3){
                defaultDirection = 3;
            }
        }
        else if (e.code === 'KeyD') {
            if(defaultDirection !== 0){
                defaultDirection = 0;
            }
        }
    })

    renderer.setAnimationLoop(render);

    window.scene = scene;
}
