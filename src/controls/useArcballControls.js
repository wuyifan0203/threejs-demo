/*
 * @Date: 2023-12-25 10:46:48
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-25 15:39:30
 * @FilePath: /threejs-demo/src/controls/useArcballControls.js
 */
import {
    Vector3,
    Mesh,
    MeshNormalMaterial,
    BoxGeometry,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initOrthographicCamera,
    initScene,
    initGUI
} from '../lib/tools/index.js';
import { ArcballControls } from '../lib/three/ArcballControls.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const orthographic = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    const scene = initScene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    orthographic.up.set(0, 0, 1);
    resize(renderer, orthographic);
    initCustomGrid(scene);
    initAxesHelper(scene);

    const controls = new ArcballControls(orthographic, renderer.domElement, scene);

    controls.addEventListener('change', render);

    const viewHelper = new ViewHelper(orthographic, renderer.domElement);

    function render() {
        renderer.clear();
        renderer.render(scene, orthographic);
        viewHelper.render(renderer);
    }

    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshNormalMaterial({});

    const mesh = new Mesh(geometry, material);

    const mesh1 = new Mesh(geometry, material);
    mesh1.position.set(2, 2, 0)

    scene.add(mesh, mesh1);
    render();

    const o = { gizmoVisible: true }

    const gui = initGUI();
    const folderOptions = gui.addFolder('Arcball parameters');
    folderOptions.add(controls, 'enabled').name('Enable controls');
    folderOptions.add(controls, 'enableGrid').name('Enable Grid');
    folderOptions.add(controls, 'enableRotate').name('Enable rotate');
    folderOptions.add(controls, 'enablePan').name('Enable pan');
    folderOptions.add(controls, 'enableZoom').name('Enable zoom');
    folderOptions.add(controls, 'cursorZoom').name('Cursor zoom');
    folderOptions.add(controls, 'adjustNearFar').name('adjust near/far');
    folderOptions.add(controls, 'scaleFactor', 1.1, 10, 0.1).name('Scale factor');
    folderOptions.add(controls, 'minDistance', 0, 50, 0.5).name('Min distance');
    folderOptions.add(controls, 'maxDistance', 0, 50, 0.5).name('Max distance');
    folderOptions.add(controls, 'minZoom', 0, 50, 0.5).name('Min zoom');
    folderOptions.add(controls, 'maxZoom', 0, 50, 0.5).name('Max zoom');
    folderOptions.add(o, 'gizmoVisible').name('Show gizmos').onChange(() => {
        controls.setGizmosVisible(o.gizmoVisible);
    });

    folderOptions.add(controls, 'copyState').name('Copy state(ctrl+c)');
    folderOptions.add(controls, 'pasteState').name('Paste state(ctrl+v)');
    folderOptions.add(controls, 'reset').name('Reset');

    const folderAnimations = folderOptions.addFolder('Animations');
    folderAnimations.add(controls, 'enableAnimations').name('Enable anim.');
    folderAnimations.add(controls, 'dampingFactor', 0, 100, 1).name('Damping');
    folderAnimations.add(controls, 'wMax', 0, 100, 1).name('Angular spd');


}
