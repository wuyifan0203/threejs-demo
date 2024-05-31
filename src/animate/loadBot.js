/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-05-31 16:08:18
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-05-31 18:02:28
 * @FilePath: /threejs-demo/src/animate/loadBot.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector2,
    Vector3,
    SkeletonHelper,
    AnimationMixer
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initSpotLight,
    initGroundPlane,
    initOrbitControls,
    initScene,
    initGUI,
    initAmbientLight,
    initStats,
    initDirectionLight,
    initCustomGrid
} from '../lib/tools/index.js';
import { GLTFLoader } from '../lib/three/GLTFLoader.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer({});
    const camera = initOrthographicCamera(new Vector3(50, 50, 50));
    camera.zoom = 10;
    const scene = initScene();

    initStats()
    initAmbientLight(scene);
    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const light = initDirectionLight();
    light.position.set(40, 40, 70);
    scene.add(light);

    const grid = initCustomGrid(scene);
    grid.rotateX(-Math.PI / 2);
    const ground = initGroundPlane(grid, new Vector2(50, 50));
    ground.position.z -= 0.01;

    const botInfo = await loadBot(scene);

    initGUIPanel(botInfo)

    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render)
}

async function loadBot(scene) {
    const loader = new GLTFLoader();
    const { scene: mesh, animations } = await loader.loadAsync('../../public/models/XBot.glb');

    console.log(animations);

    scene.add(mesh);

    const helper = new SkeletonHelper(mesh);
    helper.visible = false;
    scene.add(helper);

    const allActions = [];
    const actionsMap = {};
    const mixer = new AnimationMixer(mesh);
    animations.forEach(clip => {
        const action = mixer.clipAction(clip);
        actionsMap[clip.name] = {};
        actionsMap[clip.name]['action'] = action;
        actionsMap[clip.name]['weight'] = 0;
        allActions.push(action);
    });

    return {
        helper,
        mesh,
        actionsMap,
        allActions
    }
}

function initGUIPanel({ helper, actionsMap }) {
    const gui = initGUI({ width: 310 });
    const meshFolder = gui.addFolder('Mesh');
    meshFolder.add(helper, 'visible').name('skeletonHelper visible');

    const animateFolder = gui.addFolder('Animate');
    Object.keys(actionsMap).forEach((name) => {
        const folder = animateFolder.addFolder(name.toUpperCase());
    })


}
