/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-04 10:42:24
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-05 17:31:11
 * @FilePath: \threejs-demo\src\light\shadowRender.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    PlaneGeometry,
    MeshStandardMaterial,
    Vector3,
    OrthographicCamera,
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
    CameraHelper,
} from 'three';
import {
    initRenderer,
    initOrbitControls,
    initScene,
    resize,
    initDirectionLight,
    HALF_PI,
    initAmbientLight,
    initPerspectiveCamera,
    initGUI,
    initClock
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initPerspectiveCamera(new Vector3(-5, 8, 13));

    const scene = initScene();

    const helperScene = initScene();
    renderer.setClearColor(0x000000);

    const light = initDirectionLight();
    light.position.set(10, 15, 10);
    scene.add(light);

    const lightHelper = new DirectionalLightHelper(light);
    lightHelper.visible = false;
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
    const frustumSize = 20;
    const lightCamera = new OrthographicCamera(-frustumSize, frustumSize, frustumSize, -frustumSize, 0.5, 50);
    lightCamera.position.copy(light.position);
    lightCamera.lookAt(new Vector3(0, 0, 0));

    const lightCameraHelper = new CameraHelper(lightCamera);
    lightCameraHelper.visible = false;
    helperScene.add(lightCameraHelper);


    // 深度材料
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
            shadowBias: new Uniform(0.0005),
            shadowNormalBias: new Uniform(0.0001)
        },
        defines: {
            USE_PCF: true
        },
        vertexShader:/*glsl*/`
            varying vec3 vNormal;
            varying vec4 vWorldPosition;
            void main() {
                vNormal = normalMatrix * normal;
                vWorldPosition = modelMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader:/*glsl*/`
            varying vec3 vNormal;
            uniform vec3 uLightDirection;
            varying vec4 vWorldPosition;
            uniform sampler2D shadowMap;
            uniform mat4 lightMatrix;
            uniform float opacity;
            uniform float shadowBias;
            uniform float shadowNormalBias;

            // 255^0,255^1,255^2,255^3
            const vec4 bitShift = vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0);
            // 解包深度
            float unpackDepth(const in vec4 rgbaDepth) {
                return dot(rgbaDepth, bitShift);
            }

            void main() {
                // 将坐标转换到光源的视图空间中
                vec4 lightSpacePosition = lightMatrix * vWorldPosition;
                // 透视除法，归一化到[0,1]的范围
                vec3 projectCoords = (lightSpacePosition.xyz / lightSpacePosition.w) * 0.5 + 0.5;
                // 计算shadowNormalBias的偏移量
                float normalOffset = shadowNormalBias * (1.0 - max(0.0, dot(vNormal, uLightDirection)));

                // 是否使用PCF采样
                #ifdef USE_PCF
                    // 计算纹素
                    vec2 texelSize = 1.0 / vec2(textureSize(shadowMap, 0));
                    // PCF 5X5 采样
                    float shadow = 0.0;
                    for (int x  = -2; x <=2; x++) {
                        for (int y = -2; y <= 2; y++) {
                            vec2 offset = vec2(float(x), float(y)) * texelSize;
                            float depth = unpackDepth(texture2D(shadowMap, projectCoords.xy + offset));
                            shadow += step(projectCoords.z, depth + shadowBias + normalOffset);
                        }
                    }
                    // 求平均值
                    shadow /= 25.0;
                #else
                    // 获取深度
                    float depth = unpackDepth(texture2D(shadowMap, projectCoords.xy));                
                    // 计算bias
                    float bias = shadowBias + normalOffset;
                    // 判断是否为阴影
                    float shadow = step(projectCoords.z, depth + bias);
                #endif
                
                gl_FragColor = vec4(vec3(shadow), opacity);
            }
        `,
        side: 2,
        transparent: true
    });

    //添加生成结果
    const shadow = new Mesh(new PlaneGeometry(20, 20), shadowMaterial);
    // 防止闪烁
    shadow.position.y += 0.0001;
    shadow.rotateX(-HALF_PI);
    scene.add(shadow);

    const params = {
        autoRotate: false,
        useShadowMaterial: true,
    }

    const gui = initGUI({ width: 300 });
    gui.add(params, 'autoRotate').name('Light Rotate');
    gui.add(params, 'useShadowMaterial').name('Use ShadowMaterial').onChange(v => {
        shadowMaterial.visible = v;
        ground.receiveShadow = mesh.castShadow = !v;
        v ? materialGUI.show() : materialGUI.hide();
    });

    const materialGUI = gui.addFolder('ShadowMaterial');
    materialGUI.add(shadowMaterial.defines, 'USE_PCF').name('Use Shadow PCF').onChange(() => shadowMaterial.needsUpdate = true);
    materialGUI.add(shadowMaterial.uniforms.opacity, 'value', 0.1, 1, 0.01).name('ShadowMaterial Opacity');
    materialGUI.add(shadowMaterial.uniforms.shadowBias, 'value', -0.01, 0.01, 0.00001).name(' ShadowMaterial Bias');
    materialGUI.add(shadowMaterial.uniforms.shadowNormalBias, 'value', -0.001, 0.001, 0.0001).name(' ShadowMaterial Normal Bias');

    const helperGUI = gui.addFolder('Helper');
    helperGUI.add(lightHelper, 'visible').name('Light Helper Visible');
    helperGUI.add(lightCameraHelper, 'visible').name('Shadow Camera Helper Visible');

    //旋转灯光

    let angle = 0
    let delta = 0
    function updateLight(delta) {
        angle += 0.8 * delta;
        light.position.set(Math.sin(angle) * 10, 15, Math.cos(angle) * 10);
        lightCamera.position.copy(light.position);
        lightCamera.lookAt(0, 0, 0);
        lightCamera.updateProjectionMatrix();
    }
    const clock = initClock();
    function render() {
        delta = clock.getDelta();
        renderer.clear();
        controls.update();

        params.autoRotate && updateLight(delta);
        lightMatrix.multiplyMatrices(lightCamera.projectionMatrix, lightCamera.matrixWorldInverse);

        renderer.setRenderTarget(shadowTarget);
        renderer.clearDepth();
        scene.overrideMaterial = depthMaterial;
        renderer.render(scene, lightCamera);
        scene.overrideMaterial = null;
        renderer.setRenderTarget(null);

        renderer.render(scene, camera);

        lightHelper.visible && lightHelper.update();
        lightCameraHelper.visible && lightCameraHelper.update();
        renderer.render(helperScene, camera);
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);
}