/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-08-14 13:34:44
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-15 16:54:34
 * @FilePath: \threejs-demo\src\particle\gpuParticle.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    SphereGeometry,
    InstancedBufferGeometry,
    InstancedBufferAttribute,
    DataTexture,
    RGBAFormat,
    FloatType,
    MathUtils,
    Uniform,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    Image_Path
} from '../lib/tools/index.js';
import { ImageParticleMapper } from '../lib/custom/ImageParticleMapper.js'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

const { randFloat } = MathUtils;

window.onload = () => {
    init();
};

const positionFragmentShader = /*glsl*/`
    void main(){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

const velocityFragmentShader = /*glsl*/`
    void main(){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;


async function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);

    const size = 128;
    const count = size * size;

    const images = ['rhodesIsland.jpeg', 'rhineLab.jpeg'];

    const particleMapper = new ImageParticleMapper(count, 50, 512, 0.2);
    const dataTextures = await Promise.all(images.map(async (path) => {
        const baseUrl = `../../${Image_Path}/logo/${path}`;
        const data = await particleMapper.getData(baseUrl);
        return new DataTexture(data, size, size, RGBAFormat, FloatType);
    }));


    const gpuCtRenderer = new GPUComputationRenderer(size, size, renderer);

    const velocityTexture = gpuCtRenderer.createTexture();
    for (let i = 0, l = velocityTexture.image.data.length; i < l; i += 4) {
        velocityTexture.image.data.set([randFloat(-500, 500), randFloat(-500, 500), 0, 1], i);
    }

    const positionVariable = gpuCtRenderer.addVariable('positionTexture', positionFragmentShader, gpuCtRenderer.createTexture());
    const velocityVariable = gpuCtRenderer.addVariable('velocityTexture', velocityFragmentShader, velocityTexture);

    gpuCtRenderer.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    gpuCtRenderer.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);

    velocityVariable.material.uniforms.targetPosition = new Uniform(dataTextures[1]);



    const geometry = new SphereGeometry(0.2, 8, 8);
    const instanceGeometry = new InstancedBufferGeometry();
    instanceGeometry.setAttribute('position', geometry.attributes.position);
    instanceGeometry.setAttribute('uv', geometry.attributes.uv);
    instanceGeometry.setIndex(geometry.index);
    instanceGeometry.setAttribute('instancePosition', new InstancedBufferAttribute());

    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
}