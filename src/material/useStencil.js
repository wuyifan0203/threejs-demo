/*
 * @Date: 2023-07-25 16:53:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-30 17:53:30
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
    DirectionalLight,
    PerspectiveCamera,
    Color
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

    const sceneX = new Scene();
    const sceneY = new Scene();
    const sceneZ = new Scene();
    const sceneMain = new Scene();


    sceneX.add(directionalLight.clone());
    sceneY.add(directionalLight.clone());
    sceneZ.add(directionalLight.clone());

    sceneX.background = new Color('#cffccf');
    sceneY.background = new Color('orange');
    sceneZ.background = new Color('#050589');

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

    sceneMain.add(boxMesh, envLight);

    const coneMaterial = new MeshPhongMaterial({ color: 0xaaaaaa })
    const cone = new ConeGeometry(2, 6, 32);
    const coneMesh = new Mesh(cone, coneMaterial);

    sceneX.add(coneMesh, envLight.clone())

    const o = { debug: false }

    const gui = initGUI();

    gui.add(o, 'debug').onChange((e) => {
        renderer.setAnimationLoop(!e ? render : renderDebug);

        renderer.setScissorTest(e);
        console.log({ sceneMain, sceneX });
    })

    function render() {
        renderer.clear();
        directionalLight.position.copy(camera.position);
        const [w, h] = [window.innerWidth, window.innerHeight];
        renderer.setViewport(0,0,w,h);
        renderer.render(sceneMain, camera);

        orbitControls.update();
    }

    function renderDebug() {
        renderer.clear();

        const [w, h] = [window.innerWidth, window.innerHeight];
        directionalLight.position.copy(camera.position);

        const [hw, hh] = [w / 2, h / 2];


        renderer.setScissor(0, hh, hw, hh);
        renderer.setViewport(0, hh, hw, hh);
        renderer.render(sceneMain, camera);

        renderer.setScissor(hw, hh, hw, hh);
        renderer.setViewport(hw, hh, hw, hh);
        renderer.render(sceneX, camera);

        renderer.setScissor(0, 0, hw, hh);
        renderer.setViewport(0, 0, hw, hh);
        renderer.render(sceneY, camera);

        renderer.setScissor(hw, 0, hw, hh);
        renderer.setViewport(hw, 0, hw, hh);
        renderer.render(sceneZ, camera);


        orbitControls.update();
    }

    resize(renderer, camera);
}
