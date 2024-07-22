/*
 * @Date: 2023-12-25 09:55:13
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:37:06
 * @FilePath: /threejs-demo/src/controls/useOrbitUnlimitedControls.js
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
} from '../lib/tools/index.js';
import { OrbitUnlimitedControls } from '../lib/three/OrbitUnlimitedControls.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

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

    const controls = new OrbitUnlimitedControls(camera, renderer.domElement);
    controls.zoomToCursor = true;
    const viewHelper = new ViewHelper(camera, renderer.domElement);

    function render() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
        requestAnimationFrame(render);
    }
    render();

    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshNormalMaterial({});

    const mesh = new Mesh(geometry, material);

    const mesh1 = new Mesh(geometry, material);
    mesh1.position.set(2, 2, 0)

    scene.add(mesh, mesh1);

}
