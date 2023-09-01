/*
 * @Date: 2023-09-01 13:44:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-01 17:22:59
 * @FilePath: /threejs-demo/examples/src/animate/animateTest1.js
 */
/*
 * @Date: 2023-09-01 13:44:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-01 16:39:42
 * @FilePath: /threejs-demo/examples/src/animate/animateTest1.js
 */
/*
 * @Date: 2023-09-01 13:44:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-01 14:31:02
 * @FilePath: /threejs-demo/examples/src/animate/animateTest1.js
 */
import {
    BoxGeometry,
    Scene,
    Vector3,
    MeshPhongMaterial,
    Mesh,
    NumberKeyframeTrack,
    VectorKeyframeTrack,
    AnimationClip,
    AnimationMixer,
    Clock
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
    initRenderer, initOrthographicCamera, initDefaultLighting, initGroundPlane,
} from '../lib/tools/index.js';

import { GUI } from '../lib/util/lil-gui.module.min.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({});
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
    const scene = new Scene();
    initDefaultLighting(scene, new Vector3(40, 40, 70));
    const orbitControl = new OrbitControls(camera, renderer.domElement);

    initGroundPlane(scene);
    const geometry = new BoxGeometry(3, 3, 3);
    const material = new MeshPhongMaterial({
        color: 'orange',
        transparent:true,
        polygonOffset: true,
        polygonOffsetFactor: - 4,
    });
    const boxMesh = new Mesh(geometry, material);
    boxMesh.position.set(0, 0, 1.5);
    boxMesh.castShadow = true;
    scene.add(boxMesh);

    const clock = new Clock();




    // 
    const opacityTime = [0, 1, 2, 3, 4, 5, 6];
    const opacityValues = [0, 0.5, 0.8, 1, 0.8, 0.5, 0];

    const opacityKeyframe = new NumberKeyframeTrack(".material.opacity", opacityTime, opacityValues);

    const positionTime = [0, 3, 6];
    const positionValues = [0, 0, -3, 0, 0, 6, 0, 0, -3];

    const positionKeyframe = new VectorKeyframeTrack(".position", positionTime, positionValues);

    const animationClip = new AnimationClip("box-Move-changeOpacity", -1, [opacityKeyframe,positionKeyframe]);

    const mixer = new AnimationMixer(boxMesh);
    const action = mixer.clipAction(animationClip);

    const gui = new GUI();;

    const o = {
        start(){
            action.play();
        },
        paused(){
            action.paused = !action.paused;
        },
        stop(){
            action.stop();
        },
        reset(){
            action.reset();
        }
    }

    gui.add(o,'start');
    gui.add(o,'paused').name('paused/continue');
    gui.add(o,'stop');
    gui.add(o,'reset');


    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
        mixer.update(clock.getDelta());
    }
    renderer.setAnimationLoop(render)

}
