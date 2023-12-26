/*
 * @Date: 2023-08-19 10:03:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-21 20:28:01
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
    TextureLoader,
    MeshBasicMaterial,
    GridHelper,
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

    const loader = new TextureLoader();
    const camera = initOrthographicCamera(new Vector3(1000, -1000, 1000));

    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = SRGBColorSpace;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);

    initOrbitControls(camera, renderer.domElement);
    renderer.setAnimationLoop(render);

    const scene = initScene();
    const sphere = new Mesh(new SphereGeometry(5, 32, 32), new MeshBasicMaterial({ color: 'green' }));
    scene.add(sphere)

    const composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    // renderPass.clear = false;
    composer.addPass(renderPass);

    const texture = loader.load('../../public/images/sky2/nx.png');

    scene.background = texture;

    const scene2 = initScene();
    const grid = new GridHelper(30, 30);
    grid.rotateX(Math.PI / 2);
    scene2.add(grid);

    const renderPass2 = new RenderPass(scene2, camera);
    renderPass2.clear = false;
    composer.addPass(renderPass2);

    composer.addPass(new ShaderPass(GammaCorrectionShader))

    const effectCopy = new ShaderPass(CopyShader);
    effectCopy.renderToScreen = true;
    composer.addPass(effectCopy);

    function render() {
        renderer.clear()
        renderer.setRenderTarget(null);
        composer.render();
    }


    const gui = new GUI();


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


    gui.add(o, 'snap')
}
