import {Vector3,} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
} from '../lib/tools/index.js';
import { ViewIndicator } from '../lib/custom/ViewIndicator.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, -200, 200));
    camera.up.set(0, 0, 1);
    camera.zoom = 2
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xdddddd);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);

    const helper = new ViewIndicator();
    scene.add(helper);


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
}