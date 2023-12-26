/*
 * @Date: 2023-09-01 13:44:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-26 17:12:44
 * @FilePath: /threejs-demo/src/animate/loadModalWithAnimation.js
 */
import {
    Vector3,
    QuaternionKeyframeTrack,
    VectorKeyframeTrack,
    AnimationClip,
    AnimationMixer,
    Clock,
    Matrix4,
    Quaternion,
} from '../lib/three/three.module.js';
import {
    initRenderer, 
    initOrthographicCamera, 
    initGroundPlane, 
    initSpotLight, 
    initScene, 
    initOrbitControls, 
    initAmbientLight,
    initGUI
} from '../lib/tools/index.js';

import { GLTFLoader } from '../lib/three/GLTFLoader.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer({});
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    camera.zoom = 0.5;
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
    const scene = initScene();

    const light = initSpotLight();
    light.position.set(40, 40, 70);
    scene.add(light);

    initAmbientLight(scene);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    initGroundPlane(scene);

    const basePath = '../../public/models/';

    const loader = new GLTFLoader();

    const [parrotData, flamingoData, storkData] = await Promise.all([
        loader.loadAsync(`${basePath}Parrot.glb`),
        loader.loadAsync(`${basePath}Flamingo.glb`),
        loader.loadAsync(`${basePath}Stork.glb`),
    ])

    console.log({ parrotData, flamingoData, storkData });

    const parrot = parrotData.scenes[0];
    parrot.children[0].castShadow = true;
    parrot.scale.set(0.1, 0.1, 0.1);
    parrot.rotateX(Math.PI / 2);
    parrot.position.set(0, 0, 8);
    const flamingo = flamingoData.scenes[0];
    flamingo.children[0].castShadow = true;
    flamingo.scale.set(0.1, 0.1, 0.1);
    flamingo.rotateX(Math.PI / 2);
    flamingo.position.set(15, 0, 12);
    const stork = storkData.scenes[0];
    stork.children[0].castShadow = true;
    stork.scale.set(0.1, 0.1, 0.1);
    stork.rotateX(Math.PI / 2);
    stork.position.set(-10, 8, 10);

    scene.add(parrot);
    scene.add(flamingo);
    scene.add(stork);

    // fly Forward
    const positionKeyFrame = new VectorKeyframeTrack('.position', [0, 4, 8, 12, 16], [0, 0, 8, 0, -30, 10, 0, 0, 12, 0, 20, 8, 0, 0, 8]);

    // fly circle
    const circlePosKeyFrame = new VectorKeyframeTrack('.position', [0, 2, 4, 6, 8], [15, 0, 12, 0, -15, 12, -15, 0, 12, 0, 15, 12, 15, 0, 12]);
    const quaternionArray = []
    const angles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5, Math.PI * 2];
    // 这是个bug
    angles.forEach((angle, i) => {
        const m = new Matrix4().makeRotationAxis(new Vector3(0, 0, -1), angle).premultiply(new Matrix4().makeRotationY(-Math.PI / 2));
        const q = new Quaternion().setFromRotationMatrix(m);
        q.toArray(quaternionArray, i * 4)
    })
    const circleQueKeyFrame = new QuaternionKeyframeTrack('.quaternion', [0, 2, 4, 6, 8], quaternionArray)

    const clock = new Clock();

    const parrotMixer = new AnimationMixer(parrot);
    const parrotFly = parrotMixer.clipAction(parrotData.animations[0]);
    const parrotForward = parrotMixer.clipAction(new AnimationClip('Forward', -1, [positionKeyFrame]));

    const flamingoMixer = new AnimationMixer(flamingo);
    const flamingoFly = flamingoMixer.clipAction(flamingoData.animations[0]);
    const flamingoCircle = flamingoMixer.clipAction(new AnimationClip('Circle', -1, [circlePosKeyFrame, circleQueKeyFrame]));

    const storkMixer = new AnimationMixer(stork);
    const storkFly = storkMixer.clipAction(storkData.animations[0]);

    const gui = initGUI();;

    const o = {
        start() {
            parrotFly.play();
            parrotForward.play()
            flamingoFly.play();
            flamingoCircle.play();
            storkFly.play();
        },
        paused() {
            parrotFly.paused = !parrotFly.paused;
            parrotForward.paused = !parrotForward.paused;
            flamingoFly.paused = !flamingoFly.paused;
            storkFly.paused = !storkFly.paused;
        },
        stop() {
            parrotFly.stop();
            flamingoFly.stop();
            storkFly.stop();
        },
        reset() {
            parrotFly.reset();
            flamingoFly.reset();
            storkFly.reset();
        }
    }

    gui.add(o, 'start');
    gui.add(o, 'paused').name('paused/continue');
    gui.add(o, 'stop');
    gui.add(o, 'reset');


    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
        const delta = clock.getDelta();
        parrotMixer.update(delta);
        flamingoMixer.update(delta);
        storkMixer.update(delta);
    }
    renderer.setAnimationLoop(render)

}
