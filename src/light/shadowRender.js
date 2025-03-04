/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-04 10:42:24
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-04 19:31:31
 * @FilePath: \threejs-demo\src\light\shadowRender.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    PlaneGeometry,
    MeshStandardMaterial,
    Vector3,
    PerspectiveCamera,
    WebGLRenderTarget,
    Vector2,
    RGBAFormat,
    NearestFilter,
    ShaderMaterial,
    Uniform,
    Matrix4,
    MeshDepthMaterial,
    NoBlending,
    RGBADepthPacking,
    DirectionalLightHelper,
} from 'three';
import {
    initRenderer,
    initOrbitControls,
    initScene,
    resize,
    initDirectionLight,
    HALF_PI,
    initAmbientLight,
    initPerspectiveCamera
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initPerspectiveCamera(new Vector3(10, 8, 10));

    const scene = initScene();

    const helperScene = initScene();
    renderer.setClearColor(0x000000);

    const light = initDirectionLight();
    light.position.set(0, 15, 10);
    scene.add(light);

    const lightHelper = new DirectionalLightHelper(light);
    helperScene.add(lightHelper);

    initAmbientLight(scene);

    const controls = initOrbitControls(camera, renderer.domElement);

    const mesh = new Mesh(
        new BoxGeometry(3, 3, 3),
        new MeshStandardMaterial({
            color: '#005684',
            metalness: 0,
            roughness: 0
        })
    );
    mesh.position.set(0, 1.5, 0);
    scene.add(mesh);

    const ground = new Mesh(new PlaneGeometry(20, 20), new MeshStandardMaterial({ color: 'gray' }));
    ground.rotateX(-HALF_PI);
    scene.add(ground);


    // 添加虚拟相机，从光源的角度做渲染
    const lightCamera = new PerspectiveCamera(90, 1, 0.5, 50);
    const lightDirection = new Vector3();
    lightCamera.position.copy(light.position);
    light.getWorldDirection(lightDirection);
    lightCamera.lookAt(lightDirection);

    // 
    const depthMaterial = new MeshDepthMaterial({
        blending: NoBlending,
        depthPacking: RGBADepthPacking
    })

    // 创建阴影深度贴图
    const shadowSize = new Vector2(1024, 1024);
    const shadowTarget = new WebGLRenderTarget(shadowSize.x, shadowSize.y);
    shadowTarget.texture.format = RGBAFormat;
    shadowTarget.texture.minFilter = NearestFilter;
    shadowTarget.texture.magFilter = NearestFilter;
    shadowTarget.texture.generateMipmaps = false;
    shadowTarget.stencilBuffer = false;
    shadowTarget.depthBuffer = true;

    // 创建shadowMaterial
    const lightMatrix = new Matrix4();
    const shadowMaterial = new ShaderMaterial({
        uniforms: {
            shadowMap: new Uniform(shadowTarget.texture),
            lightMatrix: new Uniform(lightMatrix),
            opacity: new Uniform(0.5),
            shadowBias: new Uniform(0.0005)
        },
        vertexShader:/*glsl*/`
            varying vec4 vWorldPosition;
            void main() {
                vWorldPosition = modelMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader:/*glsl*/`
            varying vec4 vWorldPosition;
            uniform sampler2D shadowMap;
            uniform mat4 lightMatrix;
            uniform float opacity;
            uniform float shadowBias;

            // 255^0,255^1,255^2,255^3
            const vec4 bitShift = vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0);
            float unpackDepth(const in vec4 rgbaDepth) {
                return dot(rgbaDepth, bitShift);
            }
            void main() {
                // 将坐标转换到光源的视图空间中
                vec4 lightSpacePosition = lightMatrix * vWorldPosition;
                // 透视除法，归一化到[0,1]的范围
                vec3 projectCoords = (lightSpacePosition.xyz / lightSpacePosition.w) * 0.5 + 0.5;

                // 获取深度
                float depth = unpackDepth(texture2D(shadowMap, projectCoords.xy));
                
                // 判断是否为阴影
                float shadow = step(projectCoords.z, depth + shadowBias);
                gl_FragColor = vec4(vec3(shadow), opacity);
            }
        `,
        side: 2,
        transparent: true
    });


    const shadow = new Mesh(new PlaneGeometry(20, 20), shadowMaterial);
    // 防止闪烁
    shadow.position.y += 0.0001;
    shadow.rotateX(-HALF_PI);
    scene.add(shadow);

    function updateLight(t) {
        light.position.set(Math.sin(t / 1000) * 10, 15, Math.cos(t / 1000) * 10);
        lightCamera.position.copy(light.position);
        light.getWorldDirection(lightDirection);
        lightCamera.lookAt(lightDirection);

        lightHelper.update();
    }

    function render(t) {
        renderer.clear();
        controls.update();

  
        updateLight(t);

        lightMatrix.multiplyMatrices(lightCamera.projectionMatrix, lightCamera.matrixWorldInverse);

        renderer.setRenderTarget(shadowTarget);
        scene.overrideMaterial = depthMaterial;
        renderer.render(scene, lightCamera);
        shadowMaterial.needsUpdate = true;
        scene.overrideMaterial = null;
        renderer.setRenderTarget(null);

        renderer.render(scene, camera);
        renderer.render(helperScene, camera);
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);

}