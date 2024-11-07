

import {
    Vector3,
    AnimationMixer,
    Object3D,
    Quaternion,
    Group,
    MeshPhysicalMaterial,
    Mesh,
    SphereGeometry,
    CylinderGeometry,
    VectorKeyframeTrack,
    AnimationClip,
    QuaternionKeyframeTrack
} from "../lib/three/three.module.js";
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    initScene,
    initDirectionLight,
    modelPath,
    initClock,
    initCustomGrid,
    resize,
    initAxesHelper,
    initPerspectiveCamera,
    initAmbientLight,
    PI,
    TWO_PI,
} from "../lib/tools/index.js";

window.onload = function () {
    init();

};

function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));

    const scene = initScene();

    initAmbientLight(scene);

    const light = initDirectionLight();
    light.position.set(70, 70, 70);
    scene.add(light);

    const grid = initCustomGrid(scene);
    grid.rotateX(PI / 2);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const model = 
    scene.add(model);

    const mixer = new AnimationMixer(model);




    const clock = initClock();
    let delta = 0;
    function render() {
        delta = clock.getDelta();
        orbitControls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    render();


}