/*
 * @Date: 2023-12-25 10:46:48
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:32:52
 * @FilePath: /threejs-demo/src/controls/useFirstPersonControls.js
 */
import {
    Vector3,
    Mesh,
    MeshNormalMaterial,
    BoxGeometry,
    Clock,
} from 'three';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initScene,
    initGUI,
    initPerspectiveCamera
} from '../lib/tools/index.js';
import { FirstPersonControls } from '../lib/three/FirstPersonControls.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

window.onload = () => {
    init();
};

function init() {

    const camera = initPerspectiveCamera(new Vector3(0, -2, 2));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const renderer = initRenderer();
    renderer.autoClear = false;

    resize(renderer, camera);

    const scene = initScene();
    initCustomGrid(scene);
    initAxesHelper(scene);

    const controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 150;
    controls.lookSpeed = 0.1;
    controls.handleResize();


    const viewHelper = new ViewHelper(camera, renderer.domElement);


    const clock = new Clock();
    (function render() {
        renderer.clear();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
        controls.update(clock.getDelta());
        requestAnimationFrame(render);
    })()

    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshNormalMaterial({});

    const mesh = new Mesh(geometry, material);

    const mesh1 = new Mesh(geometry, material);
    mesh1.position.set(2, 2, 0)

    scene.add(mesh, mesh1);


    const gui = initGUI();
    gui.add(controls, 'activeLook').name('是否能够环视四周');
    gui.add(controls, 'autoForward').name('是否自动向前移动');
    gui.add(controls, 'constrainVertical').name('垂直环视是否约束').onFinishChange((e) => {
        VerticalFolder.show(e);
    });
    const VerticalFolder = gui.addFolder('垂直环视');
    VerticalFolder.add(controls, 'verticalMin', -Math.PI / 2, Math.PI / 2).name('垂直环视最小角度');
    VerticalFolder.add(controls, 'verticalMax', -Math.PI / 2, Math.PI / 2).name('垂直环视最大角度');
    gui.add(controls, 'enabled').name('Enabled');
    gui.add(controls, 'heightCoef', 0.1, 5, 0.1);
    gui.add(controls, 'heightMax', 0.1, 10, 0.1);
    gui.add(controls, 'heightMin', 0, 5, 0.1);
    gui.add(controls, 'heightSpeed');
    gui.add(controls, 'movementSpeed', 1, 300, 1);
    gui.add(controls, 'lookVertical').name('是否能够垂直环视');
    gui.add(controls, 'lookSpeed', 0, 2, 0.1);

    VerticalFolder.show(controls.constrainVertical);
}
