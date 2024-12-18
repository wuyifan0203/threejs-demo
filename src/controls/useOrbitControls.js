/*
 * @Date: 2023-05-17 19:27:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:36:11
 * @FilePath: /threejs-demo/src/controls/useOrbitControls.js
 */
import {
    Vector3,
    Mesh,
    MeshNormalMaterial,
    BoxGeometry,
} from 'three';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initOrthographicCamera,
    initScene,
    initGUI,
    initOrbitControls,
    initViewHelper
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    const scene = initScene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);
    initCustomGrid(scene);
    initAxesHelper(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    controls.zoomToCursor = true;
    const viewHelper = initViewHelper(camera, renderer.domElement);

    function update() {
        renderer.clear();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
    }

    function render() {
        if (controls.autoRotate || controls.enableDamping) {
            controls.update();
        }
        update()
        requestAnimationFrame(render);
    }
    render();



    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshNormalMaterial({});

    const mesh = new Mesh(geometry, material);

    const mesh1 = new Mesh(geometry, material);
    mesh1.position.set(2, 2, 0)

    scene.add(mesh, mesh1);


    const gui = initGUI();
    const folderOptions = gui.addFolder('OrbitControls parameters');
    folderOptions.add(controls, 'enabled').name('Enable controls');
    folderOptions.add(controls, 'enableRotate').name('Enable rotate');
    folderOptions.add(controls, 'rotateSpeed', 0, 50, 0.5).name('Rotate Speed');
    folderOptions.add(controls, 'enablePan').name('Enable pan');
    folderOptions.add(controls, 'minDistance', 0, 50, 0.5).name('Min distance');
    folderOptions.add(controls, 'maxDistance', 0, 50, 0.5).name('Max distance');
    folderOptions.add(controls, 'panSpeed', 0, 50, 0.5).name('Pan Speed');
    folderOptions.add(controls, 'enableZoom').name('Enable zoom');
    folderOptions.add(controls, 'zoomSpeed', 0, 50, 0.5).name('Zoom Speed');
    folderOptions.add(controls, 'zoomToCursor').name('Cursor zoom');
    folderOptions.add(controls, 'minZoom', 0, 50, 0.5).name('Min zoom');
    folderOptions.add(controls, 'maxZoom', 0, 50, 0.5).name('Max zoom');
    folderOptions.add(controls, 'screenSpacePanning').name('screenSpacePanning')
    folderOptions.add(controls, 'saveState').name('Save State');
    folderOptions.add(controls, 'reset').name('Reset');

    const folderAnimations = folderOptions.addFolder('Animations');
    folderAnimations.add(controls, 'autoRotate').name('Auto Rotate');
    folderAnimations.add(controls, 'autoRotateSpeed', 0, 100, 1).name('autoRotateSpeed');
    folderAnimations.add(controls, 'enableDamping').name('Enable Damping');
    folderAnimations.add(controls, 'dampingFactor', 0.01, 1, 0.01).name('Damping');




}
