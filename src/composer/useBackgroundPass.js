/*
 * @Date: 2023-08-19 10:03:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:10:08
 * @FilePath: /threejs-demo/src/composer/useBackgroundPass.js
 */
import {
    Vector3,
    SRGBColorSpace,
    Mesh,
    BoxGeometry,
    MeshBasicMaterial,
    Vector4
} from '../lib/three/three.module.js';

import { EffectComposer } from '../lib/three/EffectComposer.js'
import {
    initRenderer,
    resize,
    initOrthographicCamera,
    initScene,
    initOrbitControls,
} from '../lib/tools/index.js';
import { BackgroundPass } from './BackgroundPass.js';

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

    const scene = initScene();
    const box = new Mesh(
        new BoxGeometry(2, 2, 2),
        new MeshBasicMaterial({ color: 'red' })
    )

    scene.add(box);

    const rainbowColors = [
        [255, 0, 0],    // 红色 [R, G, B, A]
        [255, 165, 1],  // 橙色
        [255, 255, 0],  // 黄色
        [0, 255, 0],    // 绿色
        [0, 255, 255],  // 青色
        [0, 0, 255],    // 蓝色
        [128, 0, 128]   // 紫色
      ].map((item, i) => {
        return new Vector4(...item, i / 6)
      });

    const composer = new EffectComposer(renderer);

    const backgroundPass = new BackgroundPass();
    backgroundPass.setColors(rainbowColors);

    composer.addPass(backgroundPass);

    function render() {
        renderer.clear()
        composer.render();
        requestAnimationFrame(render)
    }
    render()

}
