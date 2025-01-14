/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-01-14 10:13:56
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-01-14 15:29:43
 * @FilePath: \threejs-demo\src\material\clippingSphere.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Vector3,
    Clock,
    Vector4,
    Mesh,
    MeshPhongMaterial,
    Uniform,
    Color,
    BoxGeometry,
    MeshLambertMaterial,
    MathUtils,
    SphereGeometry
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initGroundPlane,
    initOrbitControls,
    initScene,
    initGUI,
    initDirectionLight,
    initAmbientLight,
    rainbowColors,
    initCoordinates,
    initTransformControls
} from '../lib/tools/index.js';

const { randInt } = MathUtils;


window.onload = () => {
    init();
};

function init() {
    const camera = initOrthographicCamera(new Vector3(60, 113, 120));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.zoom = 0.8;
    camera.updateProjectionMatrix();

    const renderer = initRenderer();

    const scene = initScene();
    const plane = initGroundPlane(scene);
    plane.position.z = -0.05;

    initAmbientLight(scene);
    const light = initDirectionLight(0xffffff, 5);
    scene.add(light);
    light.position.copy(camera.position);
    scene.add(initCoordinates(15))

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const meshes = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const height = randInt(3, 10);
            const geometry = new BoxGeometry(1, 1, height);
            geometry.translate(0, 0, height / 2);
            const mesh = new Mesh(geometry, new MeshLambertMaterial({ color: rainbowColors[(i + j) % 6] }));
            mesh.position.set(i * 2 - 4, j * 2 - 4, 0);
            mesh.receiveShadow = mesh.castShadow = true;
            scene.add(mesh);
            meshes.push(mesh);
        }
    }

    const mesh = new Mesh(new BoxGeometry(12, 12, 12), new MeshPhongMaterial({ color: 0xff0000, side: 2, }));
    mesh.position.set(0, 0, 6)
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);


    function render() {
        orbitControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    const diffuseColor = { value: '#0000FF' }
    const uniforms = {
        clippingSphere: new Uniform(new Vector4(6, 3, 9, -8)),
        diffuseBack: new Uniform(new Color(diffuseColor.value))
    }

    const virtualSphere = new Mesh(new SphereGeometry(1, 32, 32), new MeshPhongMaterial({ color: 0xffff00, side: 2, transparent: true, opacity: 0.2 }));
    virtualSphere.position.copy(uniforms.clippingSphere.value);
    virtualSphere.scale.setScalar(Math.abs(uniforms.clippingSphere.value.w));
    scene.add(virtualSphere);

    const transformControls = initTransformControls(camera, renderer.domElement);
    scene.add(transformControls.getHelper());

    transformControls.addEventListener('dragging-changed', (event) => {
        orbitControls.enabled = !event.value;
    });
    transformControls.addEventListener('change', () => {
        uniforms.clippingSphere.value.x = virtualSphere.position.x;
        uniforms.clippingSphere.value.y = virtualSphere.position.y;
        uniforms.clippingSphere.value.z = virtualSphere.position.z;
    })

    transformControls.attach(virtualSphere);



    patchMaterial(mesh.material, uniforms);
    render();

    function update() {
        uniforms.diffuseBack.value.set(diffuseColor.value);
        mesh.material.needsUpdate = true;
    }
    resize(renderer, camera);
    const gui = initGUI();
    gui.add(uniforms.clippingSphere.value, 'w', -20, 20, 0.1).name('radius').onChange((v) => { 
        update();
        virtualSphere.scale.setScalar(Math.abs(v));
    });

    gui.addColor(diffuseColor, 'value').name('diffuseBack color').onChange(update);
    gui.add(mesh.material, 'side', { FrontSide: 0, BackSide: 1, DoubleSide: 2 });
}


function patchMaterial(material, uniforms) {
    material.onBeforeCompile = function (shader) {
        Object.assign(shader.uniforms, uniforms)

        shader.vertexShader = shader.vertexShader.replace(
            /*glsl*/`#include <common>`,
            /*glsl*/`#include <common>
            varying vec4 vWorldPosition;`
        ).replace(
            /*glsl*/`void main() {`,
            /*glsl*/`void main() {
            vWorldPosition = modelMatrix * vec4(position, 1.0);`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            /*glsl*/`#include <common>`,
            /*glsl*/`#include <common>
            varying vec4 vWorldPosition;
            uniform vec4 clippingSphere;
            uniform vec3 diffuseBack;`
        ).replace(
            /*glsl*/`vec4 diffuseColor = vec4( diffuse, opacity );`,
            /*glsl*/`vec3 color = gl_FrontFacing ? diffuse : diffuseBack;
            vec4 diffuseColor = vec4( color, opacity );`
        ).replace(
            /*glsl*/`#include <clipping_planes_fragment>`,
            /*glsl*/`#include <clipping_planes_fragment>
            if(distance(vWorldPosition.xyz, clippingSphere.xyz) * sign(clippingSphere.w) > clippingSphere.w){
                discard;
            }`
        );
    }

}