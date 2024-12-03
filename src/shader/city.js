import {
    Vector3,
} from "../lib/three/three.module.js";
import {
    initRenderer,
    initLoader,
    resize,
    initOrbitControls,
    initScene,
    modelPath,
    initClock,
    initOrthographicCamera,
    initAxesHelper,
} from "../lib/tools/index.js";

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const scene = initScene();

    const camera = initOrthographicCamera(new Vector3(-1000, 1000, 0));
    camera.zoom = 0.07;
    camera.updateProjectionMatrix();
    initAxesHelper(scene);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const loader = initLoader();
    loader.load(`../../${modelPath}/shanghai.FBX`, (model) => {
        console.log(model);
        model.scale.set(0.1, 0.1, 0.1);
        scene.add(model);
    });

    const clock = initClock();
    let delta = 0;
    resize(renderer, camera);
    function render() {
        delta = clock.getDelta();
        orbitControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

}