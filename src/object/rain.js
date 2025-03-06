/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-05 13:34:13
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-06 17:28:46
 * @FilePath: \threejs-demo\src\object\rain.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    InstancedMesh,
    Object3D,
    PlaneGeometry,
    MathUtils,
    InstancedBufferAttribute,
    ShaderMaterial,
    Vector4,
    Uniform,
    AudioListener,
    Audio
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    initGUI,
    initLoader,
    Audio_Path,
} from '../lib/tools/index.js';

const { randFloat } = MathUtils;
const dummy = new Object3D();

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);

    const controls = initOrbitControls(camera, renderer.domElement);

    const listener = new AudioListener();
    const audio = new Audio(listener);
    scene.add(listener);

    const loader = initLoader();
    loader.load(`../../${Audio_Path}/rain.mp3`, (buffer) => {
        audio.setBuffer(buffer);
        audio.play();
    })

    const params = {
        rain: new Vector4(50, 90, 50, 12000),
        play: true
    }
    let rain = null;

    const rainMaterial = new ShaderMaterial({
        uniforms: {
            uHeightRange: new Uniform(params.rain.y),
            uDropSpeed: new Uniform(100),
            uTime: new Uniform(0),
        },
        vertexShader:/*glsl*/`
            attribute float aProgress;
            attribute float aSpeed;

            varying vec2 vUv;

            uniform float uTime;
            uniform float uHeightRange;
            uniform float uDropSpeed;
        
            void main(){
                vUv = uv;
                vec3 transformed = vec3(position);
                float progress = mod(aProgress - (uTime * aSpeed * uDropSpeed / uHeightRange), 1.0);
                transformed.y += (progress * 2.0 - 1.0) * uHeightRange;
                // instanceMesh 内置的 变量instanceMatrix
                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
            }
        `,
        fragmentShader:/*glsl*/`
            varying vec2 vUv;
            void main(){
                // 由蓝到黄渐变
                vec3 color = mix(vec3(1.0, 1.0, 0.0),vec3(0.0,0.0,1.0), vUv.y);
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        onBeforeRender() {
            this.uniforms.uTime.value += 0.001;
        }
    })

    function update() {
        if (rain) {
            rain.removeFromParent();
            rain.geometry.dispose();
        }
        rainMaterial.uniforms.uHeightRange.value = params.rain.y;
        rain = createRain();
        scene.add(rain);
    }

    update();
    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);

    const gui = initGUI();
    const rainGUI = gui.addFolder('rain');
    rainGUI.add(params.rain, 'x', 0, 1000, 1).name('Size X').onChange(update);
    rainGUI.add(params.rain, 'y', 0, 500, 1).name('Size Y').onChange(update);
    rainGUI.add(params.rain, 'z', 0, 1000, 1).name('Size Z').onChange(update);
    rainGUI.add(params.rain, 'w', 100, 100000, 100).name('Count').onChange(update);
    rainGUI.add(rainMaterial.uniforms.uDropSpeed, 'value', 0, 500, 1).name('Drop Speed').onChange(update);
    gui.add(params, 'play').onChange((v) => {
        v ? audio.play() : audio.stop();
    }).name('Audio Play');
    /**
 * @description: create rain
 * @param {Vector4} params vec4(rangeX,rangeY,rangeZ,count)
 * @return {InstancedMesh}
 */
    function createRain() {
        const { x, z, w } = params.rain;

        const rain = new InstancedMesh(new PlaneGeometry(), rainMaterial, w);
        const progress = new Float32Array(w);
        const speed = new Float32Array(w);

        for (let i = 0; i < w; i++) {
            dummy.position.set(randFloat(-x, x), 0, randFloat(-z, z));
            dummy.scale.set(0.03, randFloat(0.3, 0.5), 0.3);
            dummy.updateMatrix();
            rain.setMatrixAt(i, dummy.matrix);

            progress[i] = randFloat(0, 1);
            speed[i] = dummy.scale.y * 10;
        }

        rain.geometry.setAttribute('aProgress', new InstancedBufferAttribute(progress, 1));
        rain.geometry.setAttribute('aSpeed', new InstancedBufferAttribute(speed, 1));

        return rain;
    }

}

