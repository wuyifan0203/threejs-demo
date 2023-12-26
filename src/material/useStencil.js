/*
 * @Date: 2023-07-25 16:53:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-26 16:43:19
 * @FilePath: /threejs-demo/src/material/useStencil.js
 */
import {
    Scene,
    Vector3,
    AmbientLight,
    Mesh,
    MeshBasicMaterial,
} from '../lib/three/three.module.js';
import { STLLoader } from '../lib/three/STLLoader.js'
import {
    initRenderer,
    initDirectionLight,
    resize,
    initOrbitControls,
    initGUI,
    initPerspectiveCamera
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    renderer.setClearColor(0xefefef);
    renderer.setAnimationLoop(render);

    const camera = initPerspectiveCamera(new Vector3(100, 100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const envLight = new AmbientLight();
    const directionalLight = initDirectionLight();

    const scene = initScene();

    scene.add(envLight, directionalLight);

    const loader = new STLLoader();

    const geometry = await loader.loadAsync('../../public/models/model.stl');

    const mesh = new Mesh(geometry,new MeshBasicMaterial())

    scene.add(mesh);


    const o = { debug: false }

    const gui = initGUI();

    gui.add(o, 'debug').onChange((e) => {
        renderer.setAnimationLoop(!e ? render : renderDebug);

        renderer.setScissorTest(e);
    })

    function render() {
        renderer.clear();
        directionalLight.position.copy(camera.position);
        const [w, h] = [window.innerWidth, window.innerHeight];
        renderer.setViewport(0, 0, w, h);
        renderer.render(scene, camera);

        orbitControls.update();
    }

    function renderDebug() {
        renderer.clear();

        orbitControls.update();
    }

    resize(renderer, camera);
}
