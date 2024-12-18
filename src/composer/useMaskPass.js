/*
 * @Date: 2023-08-19 14:33:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 14:51:53
 * @FilePath: /threejs-demo/src/composer/useMaskPass.js
 */
import {
    Vector3,
    Mesh,
    SRGBColorSpace,
    SphereGeometry,
    Vector2,
    MeshNormalMaterial,
} from 'three';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js'
import { MaskPass,ClearMaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {
    initRenderer,
    initOrbitControls,
    resize,
    initOrthographicCamera,
    initCustomGrid,
    initScene,
    initGUI
} from '../lib/tools/index.js';

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

    const controls = initOrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render)

    const scene = initScene();

    const sceneHelper = initScene();

    const material = new MeshNormalMaterial()

    const sphere = new Mesh(new SphereGeometry(5, 32, 32), material);
    sphere.position.set(0, 0, 5);
    scene.add(sphere)

    const grid = initCustomGrid(sceneHelper);

    sceneHelper.add(grid);

    const composer = new EffectComposer(renderer);
    const mainRenderPass = new RenderPass(scene, camera);
    mainRenderPass.clear = false;
    const renderPass = new RenderPass(sceneHelper, camera);

    const clearMask = new ClearMaskPass();

    const mainMask = new MaskPass(scene, camera);
    mainMask.inverse = true;
    composer.addPass(mainRenderPass);
    composer.addPass(renderPass);
  
    composer.addPass(mainMask);
    composer.addPass(clearMask);

    const renderScene = new TexturePass( composer.renderTarget2.texture );

    const composer2 = new EffectComposer(renderer);
    composer2.addPass(renderScene);

    function render() {
        renderer.clear()

        // renderer.render(scene,camera);
        // renderer.render(sceneHelper, camera);
        // renderer.setRenderTarget(null)
        composer2.render();
    }


    const gui = initGUI();

    const size = new Vector2();

    const o = {
        snap() {
            renderer.setRenderTarget(composer.renderTarget1);
            composer.render();
            renderer.setRenderTarget(null);

            const dataURL = renderer.domElement.toDataURL();

            console.log(
                '%c image',
                `background-image: url(${dataURL});
                 background-size: contain;
                 background-repeat: no-repeat;
                 padding: 200px;
                `,
              );
        }
    }


    render()
    gui.add(o, 'snap')
}
