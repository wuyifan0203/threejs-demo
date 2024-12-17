/*
 * @Date: 2023-09-13 16:19:45
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 13:56:13
 * @FilePath: /threejs-demo/src/camera/saveState.js
 */
import {
    Vector3,
    PointLight,
    Mesh,
    Color,
    BoxGeometry,
    MeshLambertMaterial,
} from 'three';
import {
    initRenderer,
    initOrbitControls,
    initScene,
    initAmbientLight,
    initOrthographicCamera,
    initCustomGrid,
    initGUI,
    resize,
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const stateStash = {
        FREE: {
            position: new Vector3(50, 50, 50),
            target: new Vector3(0, 0, 0),
            up: new Vector3(0, 0, 1),
            zoom: 2.5
        },
        POS_XY: {
            position: new Vector3(0, 0, 50),
            target: new Vector3(0, 0, 0),
            up: new Vector3(0, 0, 1),
            zoom: 2.5
        },
        POS_XZ: {
            position: new Vector3(0, 50, 0),
            target: new Vector3(0, 0, 0),
            up: new Vector3(0, 0, 1),
            zoom: 2.5
        },
        POS_YZ: {
            position: new Vector3(50, 0, 0),
            target: new Vector3(0, 0, 0),
            up: new Vector3(0, 0, 1),
            zoom: 2.5
        }
    };

    const renderer = initRenderer();

    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);

    const light = new PointLight(0xffffff, 3, 0, 0);
    light.position.set(0, 0, 20);

    const scene = initScene();
    scene.background = new Color(0xf0f0f0);
    scene.add(light);

    initAmbientLight(scene);
    initCustomGrid(scene)

    const controls = initOrbitControls(camera, renderer.domElement);

    (function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    })()

    const redMaterial = new MeshLambertMaterial({ color: 'red' });
    const greenMaterial = new MeshLambertMaterial({ color: 'green' });
    const blueMaterial = new MeshLambertMaterial({ color: 'blue' });

    const geometry = new BoxGeometry(3, 3, 3);

    const mesh = new Mesh(geometry, redMaterial);
    const mesh1 = new Mesh(geometry, greenMaterial);
    const mesh2 = new Mesh(geometry, blueMaterial);

    scene.add(mesh);
    scene.add(mesh1);
    mesh1.position.set(0, -4, 0)
    scene.add(mesh2);
    mesh2.position.set(0, 4, 0)

    const control = {
        lastState: 'FREE',
        state: 'FREE',
        saveState() {
            const stateValue = stateStash[control.lastState];
            stateValue.position.copy(camera.position);
            stateValue.target.copy(controls.target);
            // stateValue.up.copy(camera.up);  
            stateValue.zoom = camera.zoom;
        },
        applyState() {
            const stateValue = stateStash[control.state];

            camera.position.copy(stateValue.position);
            controls.target.copy(stateValue.target);
            // camera up 的更改需要在 orbitControls 之前
            // camera.up.copy(stateValue.up); /// 不可以执行
            camera.zoom = stateValue.zoom;
            controls.update();
        }
    }

    const gui = initGUI();
    gui.add(control, 'state', Object.keys(stateStash)).onChange((e) => {
        console.log('onChange', e);
        console.log('------------------------');
        controls.enableRotate = e === 'FREE';
        control.saveState();
        control.applyState();
        control.lastState = e
    })

    control.applyState();

    resize(renderer, camera)
}
