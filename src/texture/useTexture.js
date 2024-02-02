/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2023-12-26 16:50:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-02 18:02:05
 * @FilePath: /threejs-demo/src/texture/useTexture.js
 */
import {
    TextureLoader,
    Mesh,
    MeshBasicMaterial,
    Vector3,
    PlaneGeometry,
    BoxGeometry,
    SphereGeometry,
    // -> mapping
    // UVMapping, // 300
    // CubeReflectionMapping, // 301
    // CubeRefractionMapping, // 302
    // EquirectangularReflectionMapping, // 303
    // EquirectangularRefractionMapping, // 304

    // -> Wrapping
    // MirroredRepeatWrapping, // 1002
    // RepeatWrapping, // 1000
    // ClampToEdgeWrapping, // 1001,
    // NearestFilter, // 1003
    // NearestMipMapNearestFilter, // 1004
    // NearestMipmapLinearFilter, // 1005
    // LinearFilter, // 1006
    // LinearMipMapNearestFilter, // 1007
    // LinearMipMapLinearFilter, // 1008

    // -> texture formate
    // AlphaFormat, // 1021
    // RedFormat, //1028
    // RedIntegerFormat, //1029
    // RGFormat, //1030
    // RGIntegerFormat, //1031
    // RGBAFormat, //1023
    // RGBAIntegerFormat, //1033
    // LuminanceFormat, //1024
    // LuminanceAlphaFormat, // 1025
    // DepthFormat, // 1026
    // DepthStencilFormat, // 1027
} from '../lib/three/three.module.js';
import {
    initOrbitControls,
    initRenderer,
    initScene,
    initOrthographicCamera,
    initGUI
} from '../lib/tools/index.js';

const paths = [
    '../../public/images/sky1/nx.png',
    '../../public/images/plants/2k_earth_daymap.jpg',
];

window.onload = async () => {
    init()
}

async function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, 0, 200));
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.1;

    const scene = initScene();
    renderer.setClearColor(0xffffff);
    const controls = initOrbitControls(camera, renderer.domElement);

    const loader = new TextureLoader();

    const textures = [];
    for (let i = 0; i < paths.length; i++) {
        const texture = await loader.loadAsync(paths[i]);
        textures.push(texture);
    }

    const material = new MeshBasicMaterial({ map: textures[0], side: 2 });

    const plane = new Mesh(new PlaneGeometry(50, 50), material);
    plane.position.set(-80, 0, 0);

    const cube = new Mesh(new BoxGeometry(50, 50, 50), material);
    cube.position.set(0, 0, 0);

    const sphere = new Mesh(new SphereGeometry(25, 64, 64), material);
    sphere.position.set(80, 0, 0);

    scene.add(plane);

    scene.add(cube);

    scene.add(sphere);


    function render() {
        renderer.clear();
        controls.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const operation = {
        currentTextureIndex: 0,
        mapping: 0,
        wrapS: 1,
        wrapT: 1,
        magFilter: 6,
        minFilter: 8,
        formate: 23,
    }


    const gui = initGUI();

    gui.add(operation, 'currentTextureIndex', {
        plane: 0,
        sphere: 1,
    }).name('Switch Texture').onFinishChange(update);

    gui.add(operation, 'mapping', {
        'UV(default)': 0,
        'CubeReflection(立方体反射)': 1,
        'CubeRefraction(立方体折射)': 2,
        'EquirectangularReflection(等距反射)': 3,
        'EquirectangularRefraction(等距折射)': 4,
    }).name('mapping(映射方式)').onFinishChange(update);

    gui.add(operation, 'wrapS', {
        'Repeat(重复包裹)': 0,
        'ClampToEdge(限制边缘包裹 default)': 1,
        'MirroredRepeat(镜像重复包裹)': 2,
    }).name('wrapS(U方向包裹方式)').onFinishChange(update);

    gui.add(operation, 'wrapT', {
        'Repeat(重复包裹)': 0,
        'ClampToEdge(限制边缘包裹 default)': 1,
        'MirroredRepeat(镜像重复包裹)': 2,
    }).name('wrapT(V方向包裹方式)').onFinishChange(update);

    gui.add(operation, 'magFilter', {
        'Nearest(最近过滤)': 3,
        'Linear(线性过滤)': 6,
    }).name('magFilter(放大过滤)').onFinishChange(update);

    gui.add(operation, 'minFilter', {
        'Nearest(最近过滤)': 3,
        'NearestMipMapNearest(最近MipMap最近过滤)': 4,
        'NearestMipMapLinear(最近MipMap线性过滤)': 5,
        'Linear(线性过滤)': 6,
        'LinearMipMapNearest(线性MipMap最近过滤)': 7,
        'LinearMipMapLinear(线性MipMap线性过滤)': 8,
    }).name('minFilter(缩小过滤)').onFinishChange(update);

    gui.add(operation, 'formate', {
        'Alpha(仅透明度)': 21,
        'Red': 28,
        'RedInteger': 29,
        'RG(仅RG)': 30,
        'RGInteger': 31,
        'RGBA(包含透明度)': 23,
        'RGBAInteger': 33,
        'Luminance(仅亮度)': 24,
        'LuminanceAlpha(包含亮度和透明度)': 25,
        'Depth': 26,
        'DepthStencil': 27,
    }).name('formate(纹理格式)').onFinishChange(update);


    function update() {
        material.map = textures[operation.currentTextureIndex];
        material.map.mapping = Number(operation.mapping) + 300;
        material.map.wrapS = Number(operation.wrapS) + 1000;
        material.map.wrapT = Number(operation.wrapT) + 1000;
        material.map.magFilter = Number(operation.magFilter) + 1000;
        material.map.minFilter = Number(operation.minFilter) + 1000;
        material.map.format = Number(operation.formate) + 1000;

        material.map.needsUpdate = true;
        material.needsUpdate = true;
    }

}
