/*
 * @Date: 2023-12-18 16:50:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 15:30:29
 * @FilePath: /threejs-demo/src/composer/useWbOITPass.js
 */

import {
    Mesh,
    BoxGeometry,
    WebGLRenderer,
    PerspectiveCamera,
    SphereGeometry,
    MeshStandardMaterial,
    TorusKnotGeometry,
    TextureLoader,
    PlaneGeometry,
    Vector2,
    Float32BufferAttribute,
} from 'three';

import {
    initOrbitControls,
    initGUI,
    initScene,
    initDirectionLight,
    createBackgroundTexture,
    initAmbientLight,
    initCustomGrid,
    initCoordinates
} from '../lib/tools/index.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { WboitPass, WboitUtils } from '../lib/other/three-wboit.module.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';


window.onload = () => {
    init();
};


async function init() {

    const params = {
        showNormal: true,
        showOIT: true,
        log: false,
        weight: 1
    }
    const dom = document.getElementById('webgl-output');
    const size = new Vector2(window.innerWidth, window.innerHeight);

    const background = initScene();
    background.background = createBackgroundTexture('#1d8dd3', '#ffffff');

    const helperScene = initScene();
    initCustomGrid(helperScene);
    helperScene.add(initCoordinates(5));

    const scene = initScene();

    const camera = new PerspectiveCamera(75, size.x / size.y, 0.1, 1000);
    camera.position.set(0, 6, 1);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    dom.appendChild(renderer.domElement);

    const light = initDirectionLight();
    light.position.set(0, 0, 3);
    scene.add(light);
    initAmbientLight(scene)

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const sphereMesh = new Mesh(new SphereGeometry(), new MeshStandardMaterial({
        // vertexColors: true,
    }));
    // const sphereColors = new Float32Array(4 * sphereMesh.geometry.attributes.position.count);
    // for (let i = 0, l = sphereMesh.geometry.attributes.position.count; i < l; i++) sphereColors.set([1, 1, 1, 1], i * 4)
    // sphereMesh.geometry.setAttribute('color', new Float32BufferAttribute(sphereColors, 4));
    sphereMesh.position.set(1.5, 0, 3);
    sphereMesh.castShadow = true;
    scene.add(sphereMesh);

    const knotMesh = new Mesh(
        new TorusKnotGeometry(1, 0.4, 128, 32),
        new MeshStandardMaterial({ transparent: true, opacity: 0.2, side: 2 })
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

    const planeMesh2 = new Mesh(planeGeometry, new MeshStandardMaterial({ side: 2, map: texture1, transparent: true, opacity: 1 }));
    planeMesh2.rotation.x = Math.PI / 2;
    planeMesh2.rotation.y = Math.PI * -0.2;
    planeMesh2.position.set(-1.2, 0, -1.5);
    scene.add(planeMesh2);

    // left normal render

    const bgPass = new RenderPass(background, camera);
    bgPass.clear = false;

    const helperPass = new RenderPass(helperScene, camera);
    helperPass.clear = false;

    const effectCopy = new ShaderPass(GammaCorrectionShader);
    effectCopy.renderToScreen = true;

    const scenePass = new RenderPass(scene, camera)
    scenePass.clear = false;
    scenePass.clearDepth = true;

    const GammaCorrectionPass = new ShaderPass(GammaCorrectionShader);

    const leftComposer = new EffectComposer(renderer);
    leftComposer.addPass(bgPass);
    leftComposer.addPass(scenePass);
    leftComposer.addPass(GammaCorrectionPass);
    leftComposer.addPass(effectCopy);

    // right OIT Render 

    const scene2 = scene.clone(true);

    const wbOITPass = new WboitPass(renderer, scene2, camera);
    wbOITPass.clear = false;
    wbOITPass.clearDepth = true;

    const rightComposer = new EffectComposer(renderer);
    rightComposer.addPass(bgPass);
    rightComposer.addPass(wbOITPass);
    // rightComposer.addPass(helperPass);
    rightComposer.addPass(effectCopy);

    scene2.traverse((obj) => {
        if (obj?.isMesh) {
            if (obj.material !== undefined) {
                // const { transparent, opacity, color, side, map } = obj.material;
                // obj.material.dispose();

                // console.log(transparent, opacity, color, side, map);

                // obj.material = new MeshWboitMaterial({
                //     transparent,
                //     opacity,
                //     color,
                //     side,
                //     map
                //     // weight: 0.5
                // });

                // console.log(obj.material);
                WboitUtils.patch(obj.material);

                // if (obj.material.isMeshStandardMaterial) {
                //     obj.material.opacity = params.opacity;
                // } else if (obj.material.isShaderMaterial) {
                //     obj.material.uniforms.opacity.value = params.opacity;
                // }

                if ('wboitEnabled' in obj.material) {
                    obj.material.wboitEnabled = params.showOIT;
                }
                if (obj.material.wboitEnabled === true) {
                    obj.material.weight = params.weight;
                }

            }
        } else if (obj.isDirectionalLight) {
            // obj.visible = false;
        }
    })

    console.log(scene2, scene);

    console.log(scene2.children);


    (function render() {
        renderer.clear();
        orbitControl.update();

        if (params.showNormal && params.showOIT) {

            const halfWidth = window.innerWidth / 2;

            renderer.setScissorTest(true);

            renderer.setScissor(0, 0, halfWidth - 1, window.innerHeight);
            leftComposer.render();

            renderer.setScissor(halfWidth, 0, halfWidth, window.innerHeight);
            rightComposer.render();

            renderer.setScissorTest(false);
        } else if (params.showNormal) {
            leftComposer.render();
        } else if (params.showOIT) {
            rightComposer.render();
        }
        requestAnimationFrame(render);
    })()

    resize();



    function resize() {
        size.set(window.innerWidth, window.innerHeight);
        const { x, y } = size;

        renderer.setSize(x, y);
        leftComposer.setSize(x, y);
        rightComposer.setSize(x, y);
    }

    window.addEventListener('resize', resize);

    const gui = initGUI();
    gui.add(params, 'showNormal');
    gui.add(params, 'showOIT');
}
