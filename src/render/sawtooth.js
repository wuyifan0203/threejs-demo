/*
 * @Date: 2023-12-14 17:51:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-15 14:24:34
 * @FilePath: /threejs-demo/src/render/sawtooth.js
 */

import {
    Mesh,
    Vector3,
    AmbientLight,
    BoxGeometry,
    MeshNormalMaterial,
    WebGLRenderTarget,
    SRGBColorSpace
} from '../lib/three/three.module.js';
import { EffectComposer } from '../lib/three/EffectComposer.js';
import { RenderPass } from '../lib/three/RenderPass.js';
import { OutputPass } from '../lib/three/OutputPass.js';
import { CopyShader } from '../lib/three/CopyShader.js';
import { ShaderPass } from '../lib/three/ShaderPass.js';
import { GammaCorrectionShader } from '../lib/three/GammaCorrectionShader.js';
import { FXAAShader } from '../lib/three/FXAAShader.js'

import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initOrbitControls,
    initScene,
    createBackgroundTexture,
    initDirectionLight
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;


    const camera = initOrthographicCamera(new Vector3(-100, -100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.zoom = 2;

    const scene = initScene();
    const scene2 = initScene();

    scene2.background = createBackgroundTexture('#ffffff', '#c6e9f7')

    const light = initDirectionLight();
    light.position.set(20, 20, 20);
    light.target = scene;


    scene.add(light);
    scene.add(new AmbientLight());

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const geometry = new BoxGeometry(2, 2, 2);
    const material = new MeshNormalMaterial()

    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    scene.add(mesh);

    const mesh2 = new Mesh(geometry, material);
    mesh2.position.set(1, 1, 1);
    scene.add(mesh2);


    const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { colorSpace: SRGBColorSpace, });

    const composer = new EffectComposer(renderer, renderTarget);
    const rendererPass = new RenderPass(scene, camera);
    const backgroundPass = new RenderPass(scene2, camera);
    rendererPass.clear = false;
    const gamma = new ShaderPass(GammaCorrectionShader);
    const copyPass = new ShaderPass(CopyShader);
    const FXAA = new ShaderPass(FXAAShader);
    FXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);

    composer.addPass(backgroundPass)
    composer.addPass(rendererPass);
    // composer.addPass(gamma);
    // composer.addPass(FXAA);
    // composer.addPass(outputPass);
    composer.addPass(copyPass);






    function render() {
        renderer.clear();
        orbitControl.update();


        // const halfWidth = renderer.domElement.offsetWidth / 2;


        // renderer.setScissorTest(true);

        // renderer.setScissor(0, 0, halfWidth - 1, renderer.domElement.offsetHeight);
        // renderer.render(scene2, camera)
        // renderer.render(scene, camera);

        // renderer.setScissor(halfWidth, 0, halfWidth, renderer.domElement.offsetHeight);
        composer.render();

        // renderer.setScissorTest(false);
    }

    renderer.setAnimationLoop(render);

    resize(renderer, camera);
}
