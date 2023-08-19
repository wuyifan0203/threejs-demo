/*
 * @Date: 2023-08-19 10:03:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-19 14:39:31
 * @FilePath: /threejs-demo/examples/src/composer/useCopyShader.js
 */
/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-19 13:09:59
 * @FilePath: /threejs-demo/examples/src/composer/useCopyShader.js
 */
import {
    Vector3,
    Scene,
    Mesh,
    SRGBColorSpace,
    SphereGeometry,
    Vector2,
    MeshBasicMaterial,
} from '../lib/three/three.module.js';

import { RenderPass } from '../lib/three/RenderPass.js'
import { ShaderPass } from '../lib/three/ShaderPass.js'
import { CopyShader } from '../lib/three/CopyShader.js'
import { EffectComposer } from '../lib/three/EffectComposer.js'
import { GUI } from '../lib/util/lil-gui.module.min.js';
import {
    initRenderer,
    initOrbitControls,
    resize,
    initOrthographicCamera,
} from '../lib/tools/index.js';
import { GammaCorrectionShader } from '../lib/three/GammaCorrectionShader.js';

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

    const scene = new Scene();

    const sphere = new Mesh(new SphereGeometry(5, 32, 32), new MeshBasicMaterial({ color: 'green' }));
    scene.add(sphere)

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    renderPass.renderToScreen = true;
    composer.addPass(renderPass);

    composer.addPass(new ShaderPass(GammaCorrectionShader))

    const effectCopy = new ShaderPass(CopyShader);
    effectCopy.clear = true
    renderPass.renderToScreen = false;
    composer.addPass(effectCopy);

    function render() {
        renderer.clear()
        renderer.setRenderTarget(null)
        composer.render();
    }


    const gui = new GUI();

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
