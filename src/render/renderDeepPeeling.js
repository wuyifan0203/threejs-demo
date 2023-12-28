/*
 * @Date: 2023-12-18 16:50:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-28 14:56:45
 * @FilePath: /threejs-demo/src/render/renderDeepPeeling.js
 */

import {
    Mesh,
    AmbientLight,
    BoxGeometry,
    WebGLRenderer,
    Vector2,
    PerspectiveCamera,
    SphereGeometry,
    MeshStandardMaterial,
    TorusKnotGeometry,
    TextureLoader,
    PlaneGeometry,
} from '../lib/three/three.module.js';

import {
    initOrbitControls,
    initGUI,
    initScene,
    initDirectionLight
} from '../lib/tools/index.js';
import { DepthPeeling } from './DepthPeeling.js';
// import { DepthPeeling } from './DepthPeeling2.js';
import { debugDeepPeeling } from './debugDepthPeeling.js'

window.onload = () => {
    init();
};


async function init() {

    const sizeMap = {
        '1024*1024': new Vector2(1024, 1024),
        '1280*720': new Vector2(1280, 720),
        '1600*900': new Vector2(1600, 900),
        '1600*1200': new Vector2(1600, 1200),
        '1920*1080': new Vector2(1920, 1080),
    };

    const params = {
        size: '1024*1024',
        layers: 3,
        enable: true
    }

    const size = sizeMap[params.size];
    const dom = document.getElementById('webgl-output');

    const scene = initScene();
    const camera = new PerspectiveCamera(75, size.x / size.y, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const renderer = new WebGLRenderer();
    renderer.setSize(size.x, size.y);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    dom.appendChild(renderer.domElement);


    const light = initDirectionLight();
    light.castShadow = true;
    light.position.set(0, 0, 3);
    scene.add(light);
    scene.add(new AmbientLight());

    const orbitControl = initOrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change', render);

    const sphereMesh = new Mesh(new SphereGeometry(), new MeshStandardMaterial());
    sphereMesh.position.set(1.5, 0, 3);
    sphereMesh.castShadow = true;
    scene.add(sphereMesh);

    const knotMesh = new Mesh(
        new TorusKnotGeometry(1, 0.4, 128, 32),
        new MeshStandardMaterial({ transparent: true, opacity: 0.5, side: 2 })
    );
    knotMesh.rotateX(Math.PI / 2)
    knotMesh.receiveShadow = true;
    scene.add(knotMesh);

    const boxMesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial({ color: 0xf0a000 }));
    scene.add(boxMesh);

    const loader = new TextureLoader();
    const texture1 = await loader.loadAsync('../../public/images/render/sprite.png');

    const planeGeometry = new PlaneGeometry(3, 3);

    const planeMesh1 = new Mesh(planeGeometry, new MeshStandardMaterial({ side: 2, map: texture1 }));
    planeMesh1.rotateX(Math.PI / 2);
    planeMesh1.position.set(-1.6, 0, 1.5);
    scene.add(planeMesh1);

    const planeMesh2 = new Mesh(planeGeometry, new MeshStandardMaterial({ side: 2, map: texture1, transparent: true }));
    planeMesh2.rotation.x = Math.PI / 2;
    planeMesh2.rotation.y = Math.PI * -0.2;
    planeMesh2.position.set(-1.2, 0, -1.5);
    scene.add(planeMesh2);


    /// depthPeeling 
    const depthPeeling = new DepthPeeling(size.x, size.y, params.layers, renderer.getPixelRatio());
    // add scene
    depthPeeling.add(scene);

    // const debug = debugDeepPeeling(scene,camera);
    // debug.setDepth(params.layers);

    const gui = initGUI();

    gui.add(params, 'size', Object.keys(sizeMap)).onChange(() => {
        resize();
        render();
    });
    gui.add(params, 'layers', [1, 2, 3, 4, 5, 6]).onChange((e) => {
        depthPeeling.setDepth(e);
        debug.setDepth(e)
        render()
    });
    gui.add(params, 'enable').onChange(render);


    function render() {
        if (!params.enable) {
            renderer.render(scene, camera)
        } else {
            depthPeeling.render(renderer, camera);
            // debug.renderImage()
        }
    }
    resize();
    // render();

    renderer.setAnimationLoop(render)

    function resize() {
        const { x, y } = sizeMap[params.size];
        renderer.setSize(x, y);
        camera.aspect = x / y;
        camera.updateProjectionMatrix();
        depthPeeling.setScreenSize(x, y, renderer.getPixelRatio());
        // debug.setSize(x, y)
    }

    window.addEventListener('resize', resize);
}
