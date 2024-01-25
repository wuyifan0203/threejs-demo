/*
 * @Date: 2023-08-19 10:03:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-25 19:26:21
 * @FilePath: /threejs-demo/src/composer/useBackgroundPass.js
 */
import {
    Vector3,
    SRGBColorSpace,
    Mesh,
    BoxGeometry,
    MeshBasicMaterial,
    Float32BufferAttribute,
} from '../lib/three/three.module.js';

import { ShaderPass } from '../lib/three/ShaderPass.js'
import { EffectComposer } from '../lib/three/EffectComposer.js'
import {
    initRenderer,
    resize,
    initOrthographicCamera,
    initScene,
    initOrbitControls,
} from '../lib/tools/index.js';
import { BackgroundPass } from './BackgroundPass.js';
import { RenderPass } from '../lib/three/RenderPass.js';
import { CopyShader } from '../lib/three/CopyShader.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(1000, -1000, 1000));

    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = SRGBColorSpace;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);

    const controls = initOrbitControls(camera, renderer.domElement)


    const scene = initScene();
    const box = new Mesh(
        new BoxGeometry(2, 2, 2),
        new MeshBasicMaterial({ color: 'red' })
    )

    scene.add(box);

    const composer = new EffectComposer(renderer);

    const backgroundPass = new BackgroundPass();
    backgroundPass.clearDepth = true;

    const renderPass = new RenderPass(scene, camera);
    renderPass.clearDepth = true;
    renderPass.clear = false;

    composer.addPass(backgroundPass);
    composer.addPass(renderPass);

    composer.addPass(new ShaderPass(CopyShader));

    function render() {
        renderer.clear()
        composer.render();
    }

    controls.addEventListener('change', render);

    render()

}
