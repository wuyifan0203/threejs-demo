import {
    Mesh,
    BoxGeometry,
    MeshNormalMaterial,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    const mesh = new Mesh(new BoxGeometry(3, 3, 3), new MeshNormalMaterial());
    scene.add(mesh);

    const messageHandler = {};

    const studioWorker = new Worker('./rotate.worker.js', { type: 'module' });
    studioWorker.onmessage = function ({ data }) {
        if (data.type in messageHandler) {
            const response = messageHandler[data.type](data.payload);
            console.log('response: ', response);
            if (response) studioWorker.postMessage({ type: data.type, payload: response });
        }
    }
    studioWorker.onerror = function (e) {
        console.log('error: ', e);
    }
    studioWorker.onmessageerror = function (e) {
        console.log('messageerror: ', e.message);
    }


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
}