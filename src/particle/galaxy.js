/*
 * @Date: 2023-12-24 01:07:12
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-07-25 17:52:59
 * @FilePath: /threejs-demo/src/particle/galaxy.js
 */
import {
    BufferGeometry,
    PointsMaterial,
    BufferAttribute,
    Color,
    Points,
    Vector3,
    TextureLoader
} from '../lib/three/three.module.js';
import {
    initRenderer,
    resize,
    initScene,
    initGUI,
    initOrbitControls,
    initPerspectiveCamera,
} from '../lib/tools/index.js';


window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;

    const camera = initPerspectiveCamera(new Vector3(10, 10, 10));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const scene = initScene();
    const basePath = '../../public/images/plants/2k_';
    const loader = new TextureLoader();
    const getTexture = (path) => loader.load(basePath + path);
    scene.background = getTexture('stars_milky_way.jpg');

    const controls = initOrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;

    resize(renderer, camera);

    const params = {
        count: 20000,
        branch: 7,
        radius: 9,
        scale: 0.5
    }
    const material = new PointsMaterial({
        // color: 0xff0000,
        size: 0.1,
        vertexColors: true
    });

    const points = new Points(new BufferGeometry(), material);

    scene.add(points);

    function updateGeometry() {
        points.geometry.dispose();
        const geometry = createGeometry(params);
        points.geometry = geometry;
    }

    updateGeometry();

    function render() {
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    const gui = initGUI();
    gui.add(params, 'count', 1000, 50000, 10).onChange(updateGeometry);
    gui.add(params, 'branch', 1, 10, 1).onChange(updateGeometry);
    gui.add(params, 'radius', 5, 10, 0.1).onChange(updateGeometry);
    gui.add(params, 'scale', 0, 3, 0.1).onChange(updateGeometry);

}

function createGeometry(params) {

    const { sin, cos, random, pow, floor } = Math;

    const geometry = new BufferGeometry();

    const { count, radius, branch, scale } = params
    const position = new Float32Array(count * 3);

    const angleOfBranch = (Math.PI * 2) / branch;

    // 0,0.1,0.3,0.8,1

    const color = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const r = random() * radius * pow(random(), 3);

        const angle = (i % branch) * angleOfBranch;

        const offset = scale * r;

        const total = angle + offset;

        const offsetHeight = (radius - r);

        const randX = (pow(random() * 2 - 1, 3) * offsetHeight) / radius;
        const randY = (pow(random() * 2 - 1, 3) * offsetHeight) / radius;
        const randZ = (pow(random() * 2 - 1, 3) * offsetHeight) / radius;

        const x = r * cos(total) + randX;
        const y = r * sin(total) + randY;
        const z = randZ;

        position[i * 3] = x;
        position[i * 3 + 1] = y;
        position[i * 3 + 2] = z;

        const scaleR = r / radius;
        const lerp = (scaleR) % 0.2;



        const vertexColor = getColor(scaleR, lerp);

        color[i * 3] = vertexColor.r;
        color[i * 3 + 1] = vertexColor.g;
        color[i * 3 + 2] = vertexColor.b;
    }


    geometry.setAttribute('position', new BufferAttribute(position, 3));
    geometry.setAttribute('color', new BufferAttribute(color, 3));

    return geometry;

}


const colorHash = ['#fefefe', '#f5f6fa', '#e7d9cd', '#90abbc', '#212c31', '#32313e'];
const pice = 1 / (colorHash.length - 1);
const startColor = new Color();
const endColor = new Color();
const getBetweenColor = (index) => {
    const prev = Math.floor(index / pice);
    const next = prev + 1;
    startColor.set(colorHash[prev]);
    endColor.set(colorHash[next]);
}

/**
 * 获取插值颜色
 * @param {number} index - 归一化的索引值（0到1之间）
 * @param {number} lerp - 插值系数（0到1之间）
 * @returns {THREE.Color} - 插值后的颜色
 */
function getColor(index, lerp) {
    getBetweenColor(index);
    return  startColor.lerp(endColor, lerp);
}