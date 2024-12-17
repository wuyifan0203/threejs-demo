/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-25 13:54:50
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-07-26 13:40:46
 * @FilePath: /threejs-demo/src/particle/rain2.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    BufferGeometry,
    PointsMaterial,
    Points,
    Vector3,
    Float32BufferAttribute,
    BoxGeometry,
    Mesh,
    MeshNormalMaterial,
    Clock,
    ShaderMaterial
} from 'three';
import {
    initRenderer,
    resize,
    initScene,
    initOrbitControls,
    initOrthographicCamera,
    initGUI,
    initStats
} from '../lib/tools/index.js';
import { createRandom } from '../lib/tools/math.js';

window.onload = () => {
    init();
};

const vertexShader = /*glsl*/`
#pragma vscode_glsllint_stage : vert
attribute vec3 initPosition;
attribute float speed;
uniform float dt;
uniform float range;
uniform float size;
const float gravity = 9.8;
void main() {
    vec3 transformed = initPosition;
    float time = dt;
    transformed.z += dt * (speed - 0.5 * gravity * dt); 
    if(transformed.z < 0.0){
        transformed.z = 0.0;
    }
    gl_PointSize = size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`

const fragmentShader = /*glsl*/`
#pragma vscode_glsllint_stage : frag
void main() {
    gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);
}
`


function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(200, 200, 200))
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = initScene();
    const stats = initStats();

    const controls = initOrbitControls(camera, renderer.domElement);
    resize(renderer, camera);
    const geometry = new BufferGeometry();

    const material = new ShaderMaterial({
        uniforms: {
            dt: { value: 0.0 },
            range: { value: 40 },
            size: { value: 1 }
        },
        vertexShader,
        fragmentShader
    });
    const points = new Points(geometry, material);
    scene.add(points);

    scene.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial({})));

    const options = {
        count: 20000,
        range: 40,
    }

    const clock = new Clock()
    function render() {
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
        stats.update();
        points.material.uniforms.dt.value = clock.getElapsedTime();
        requestAnimationFrame(render);
    }
    render();

    function updateGeometry() {
        geometry.dispose();
        const halfRange = options.range / 2;
        const position = new Float32Array(options.count * 3);
        const initPosition = new Float32Array(options.count * 3);
        const speeds = new Float32Array(options.count);

        for (let i = 0, l = options.count; i < l; i++) {
            const vertex = [createRandom(-halfRange, halfRange), createRandom(-halfRange, halfRange), createRandom(0, options.range)]
            position.set(vertex, i * 3);
            initPosition.set(vertex, i * 3);
            speeds[i] = createRandom(0.1, 0.3);
        }
        geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
        geometry.setAttribute('initPosition', new Float32BufferAttribute(initPosition, 3));
        geometry.setAttribute('speed', new Float32BufferAttribute(speeds, 1));
    }

    updateGeometry();

    const gui = initGUI();
    gui.add(options, 'range', 30, 100).onChange(updateGeometry);
    gui.add(options, 'count', 1000, 10000).onChange(updateGeometry);
    gui.add(points.material.uniforms.size, 'value', 1, 10, 0.2).name('size').onChange(() => {
        points.material.needsUpdate = true;
    });



}