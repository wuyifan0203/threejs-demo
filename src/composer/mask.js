/*
 * @Date: 2023-01-10 09:37:35
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-18 21:00:56
 * @FilePath: /threejs-demo/examples/src/composer/mask.js
 */
import {
    Vector3,
    Mesh,
    MeshPhongMaterial,
    SphereGeometry,
    SpotLight,
    AmbientLight,
    Object3D,
} from '../lib/three/three.module.js';

import { RenderPass } from '../lib/three/RenderPass.js'
import { ClearMaskPass, MaskPass } from '../lib/three/MaskPass.js'
import { ShaderPass } from '../lib/three/ShaderPass.js'
import { SepiaShader } from '../lib/three/SepiaShader.js'
import { ColorifyShader } from '../lib/three/ColorifyShader.js'
import { GUI } from '../lib/util/lil-gui.module.min.js';
import {
    initRenderer,
    initOrbitControls,
    resize,
    initOrthographicCamera,
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.setAnimationLoop(render)
    const camera = initOrthographicCamera(new Vector3(14, -16, 13));

    renderer.setClearColor(0xff0000);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);

    const controls = initOrbitControls(camera, renderer.domElement);

    const sceneA = initScene();
    const sceneB = initScene();
    const sceneC = initScene();

    const sphere1 = new Mesh(new SphereGeometry(10, 32, 32), new MeshPhongMaterial({ color: 'green' }));
    const objA = new Object3D();
    initLight(objA)
    sceneA.add(objA)
    sceneA.add(sphere1);

    const sphere2 = new Mesh(new SphereGeometry(5, 32, 32), new MeshPhongMaterial({ color: 'blue' }));
    const objB = new Object3D();
    initLight(objB)
    sceneA.add(objB)
    sceneA.add(sphere2);

    const renderPassA = new RenderPass(sceneA, camera);
    renderPassA.clear = false;
    const renderPassB = new RenderPass(sceneB, camera);
    renderPassB.clear = false;
    const renderPassC = new RenderPass(sceneC, camera);


    const clearMask = new ClearMaskPass();
    const maskA = new MaskPass(sceneA, camera);
    const maskB = new MaskPass(sceneB, camera);

    const effectSepia = new ShaderPass(SepiaShader);
    effectSepia.uniforms['amount'].value = 0.8;
    const effectColorify = new ShaderPass(ColorifyShader);
    effectColorify.uniforms['color'].value.setRGB(0.5, 0.5, 1);

    const effectCopy = new ShaderPass(CopyShader);
    effectCopy.renderToScreen = true;

    function render() {
        renderer.clear();
        controls.update();
        renderer.render(sceneA, camera);
    }
}

function initLight(object3D) {
    var position = (initialPosition !== undefined) ? initialPosition : new Vector3(-10, 30, 40);

    var spotLight = new SpotLight(0xffffff);
    spotLight.position.copy(position);
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.fov = 15;
    spotLight.castShadow = true;
    spotLight.decay = 2;
    spotLight.penumbra = 0.05;
    spotLight.name = "spotLight"

    object3D.add(spotLight);

    var ambientLight = new AmbientLight(0x343434);
    ambientLight.name = "ambientLight";
    object3D.add(ambientLight);
}


