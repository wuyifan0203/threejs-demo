/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-05 17:30:07
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 15:34:06
 * @FilePath: /threejs-demo/src/shader/fresnelEffect.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    resize,
    initScene
} from '../lib/tools/index.js';
import { AdditiveBlending, Color, Mesh, ShaderMaterial, TorusKnotGeometry, Vector3 } from '../lib/three/three.module.js';

window.onload = () => {
    init();
}

const vs = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
    vNormal = normalize( normalMatrix * normal);
    vPositionNormal =  normalize(modelViewMatrix * vec4(position,1.0 )).xyz;
    gl_Position =  projectionMatrix * modelViewMatrix * vec4(position,1.0 );
}
`

const fs = /* glsl */ `
uniform vec3 glowColor;
uniform float bias;
uniform float power;
uniform float scale;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
    float alpha = pow( bias + scale * abs(dot(vNormal, vPositionNormal)), power );
    gl_FragColor = vec4( glowColor, alpha );
}
`

function init() {
    const renderer = initRenderer();
    renderer.setClearColor(new Color(0x000000));
    const camera = initOrthographicCamera(new Vector3(7, 4, 57));
    camera.zoom = 0.4;

    const scene = initScene();

    const material = new ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms: {
            scale: { value: -1.0 },
            power: { value: 2.0 },
            bias: { value: 1.0 },
            glowColor: { value: new Color(0x00ffff) }
        },
        side: 0,
        blending: AdditiveBlending,
        transparent: true
    });

    const geometry = new TorusKnotGeometry(10, 3, 100, 64);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    function render() {
        orbitControls.update();
        renderer.render(scene, camera)
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);

    const gui = initGUI();
    gui.add(material.uniforms.scale, 'value', -10, 10, 0.1).name('scale');
    gui.add(material.uniforms.power, 'value', 0, 10, 0.1).name('power');
    gui.add(material.uniforms.bias, 'value', 0, 2, 0.1).name('bias');

}