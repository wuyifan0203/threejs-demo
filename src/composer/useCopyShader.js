/*
 * @Date: 2023-08-19 10:03:46
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:15:52
 * @FilePath: /threejs-demo/src/composer/useCopyShader.js
 */
import {
    Vector3,
    Mesh,
    SRGBColorSpace,
    SphereGeometry,
    TextureLoader,
    MeshStandardMaterial,
    GridHelper,
} from 'three';

import { RenderPass } from '../lib/three/RenderPass.js'
import { ShaderPass } from '../lib/three/ShaderPass.js'
import { CopyShader } from '../lib/three/CopyShader.js'
import { EffectComposer } from '../lib/three/EffectComposer.js'
import {
    initRenderer,
    initOrbitControls,
    resize,
    initOrthographicCamera,
    initScene,
    initGUI,
    initDirectionLight
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

    const scene = initScene();
    const light = initDirectionLight();
    scene.add(light)

  
    const sphere = new Mesh(new SphereGeometry(5, 32, 32), new MeshStandardMaterial({ color: '#90ff79' }));
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

    function update() {
        renderer.clear()
        renderer.setRenderTarget(null);
        light.position.copy(camera.position)
        composer.render();
    }

    function render() {
        update();
        requestAnimationFrame(render);
    }
    render();


    const gui = initGUI();


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
