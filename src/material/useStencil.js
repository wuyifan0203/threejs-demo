/*
 * @Date: 2023-07-25 16:53:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-29 20:58:41
 * @FilePath: /threejs-demo/src/material/useStencil.js
 */
import {
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    Scene,
    Vector3,
    ConeGeometry,
    MeshPhongMaterial,
    AmbientLight,
    DirectionalLight
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initOrbitControls,
    initGUI
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.setClearColor(0xefefef);
    renderer.setAnimationLoop(render);

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const envLight = new AmbientLight();
    const directionalLight = new DirectionalLight();
    directionalLight.target

    camera.add(directionalLight);

    const sceneX = new Scene();
    const sceneY = new Scene();
    const sceneZ = new Scene();
    const sceneMain = new Scene();

    const box = new BoxGeometry(10, 10, 10);

    const boxMaterial = [
        new MeshBasicMaterial({ color: 'red' }),
        new MeshBasicMaterial({ color: 'orange' }),
        new MeshBasicMaterial({ color: 'skyblue' }),
        new MeshBasicMaterial({ color: 'white' }),
        new MeshBasicMaterial({ color: 'yellow' }),
        new MeshBasicMaterial({ color: 'lime' }),
    ]
    const boxMesh = new Mesh(box, boxMaterial);

    sceneMain.add(boxMesh,envLight);

    const coneMaterial = new MeshPhongMaterial({ color: 0xaaaaaa })
    const cone = new ConeGeometry(2, 6, 32);
    const coneMesh = new Mesh(cone, coneMaterial);

    sceneX.add(coneMesh,envLight.clone())

    const o = { debug: false }

    const gui = initGUI();

    gui.add(o, 'debug').onChange((e) => {
        renderer.setAnimationLoop(!e ? render : renderDebug);

        console.log({sceneMain,sceneX});
    })

    function render() {
        renderer.clear();
        renderer.render(sceneMain, camera);
        orbitControls.update();
    }

    function renderDebug() {
        renderer.clear();
        renderer.render(sceneX, camera);
        orbitControls.update();
    }

    resize(renderer, camera);
}
