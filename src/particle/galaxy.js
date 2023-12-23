/*
 * @Date: 2023-12-24 01:07:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-24 02:11:25
 * @FilePath: /threejs-demo/src/particle/galaxy.js
 */
import {
    Scene,
    PerspectiveCamera,
    Sprite,
    SpriteMaterial,
    BufferGeometry,
    PointsMaterial,
    BufferAttribute,
    Color,
    Points,
    Vector3,
} from '../lib/three/three.module.js';
import {
    initRenderer, 
    resize, 
    initScene, 
    initGUI, 
    initOrbitControls, 
    initPerspectiveCamera,
    initCoordinates
} from '../lib/tools/index.js';


window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    renderer.setClearColor(0xffff00);

    const camera = initPerspectiveCamera(new Vector3(10, 10, 10));
    camera.lookAt(0, 0, 0);
    camera.up.set(0,0,1);

    const scene = initScene();

    const controls = initOrbitControls(camera, renderer.domElement);

    scene.add(initCoordinates(10));


    resize(renderer, camera);
    renderer.setAnimationLoop(render);

    const params = {
        count: 300,
        branch: 3,
        radius: 5,
    }
    const material = new PointsMaterial({ color: 0xff0000, size: 0.1 });

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
    }

}

function createGeometry(params) {

    const {sin,cos,random} = Math;

    const geometry = new BufferGeometry();

    const { count, radius, branch } = params
    const position = new Float32Array(count * 3);

    const hr = radius * 0.5;
    const angleOfBranch = (Math.PI * 2) / branch;

    for (let i = 0; i < count; i++) {

        const angle = (i % branch) * angleOfBranch;

        const r = random() * radius;

        const x = r * cos(angle);
        const y = r * sin(angle);
        const z = 0;

        position[i * 3] = x;
        position[i * 3 + 1] = y;
        position[i * 3 + 2] = z;
    }

    // const color = new Float32Array(count * 3);

    geometry.setAttribute('position', new BufferAttribute(position, 3));

    return geometry;

}

