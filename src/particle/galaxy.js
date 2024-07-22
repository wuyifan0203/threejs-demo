/*
 * @Date: 2023-12-24 01:07:12
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-01 16:06:57
 * @FilePath: /threejs-demo/src/particle/galaxy.js
 */
import {
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
    initCoordinates,
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
    camera.up.set(0, 0, 1);

    const scene = initScene();

    const controls = initOrbitControls(camera, renderer.domElement);

    scene.add(initCoordinates(10));


    resize(renderer, camera);

    const params = {
        count: 10000,
        branch: 3,
        radius: 5,
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

        const offfetHeight = (radius - r);

        const randX = (pow(random() * 2 - 1, 3) * offfetHeight) / radius;
        const randY = (pow(random() * 2 - 1, 3) * offfetHeight) / radius;
        const randZ = (pow(random() * 2 - 1, 3) * offfetHeight) / radius;

        const x = r * cos(total) + randX;
        const y = r * sin(total) + randY;
        const z = randZ;

        position[i * 3] = x;
        position[i * 3 + 1] = y;
        position[i * 3 + 2] = z;

        const scaleR = r / radius;
        const index = (scaleR / 5)//floor(scaleR / 50);
        const lerp = (scaleR) % 0.2;

        console.log(index, lerp);


        const vertexColor = getColor(index, lerp);

        color[i * 3] = vertexColor.r;
        color[i * 3 + 1] = vertexColor.g;
        color[i * 3 + 2] = vertexColor.b;
    }


    geometry.setAttribute('position', new BufferAttribute(position, 3));
    geometry.setAttribute('color', new BufferAttribute(color, 3));

    return geometry;

}


function getColor(index, lerp) {
    const colorHash = ['#ffffff', '#f5f6fa', '#e7d9cd', '#90abbc', '#212c31', '#32313e'];
    const color = new Color();
    const lerpColor = new Color();

    return ((index, lerp) => {
        color.set(colorHash[index]);
        lerpColor.set(colorHash[index + 1]);
        color.lerp(lerpColor, lerp);
        return {
            r: color.r,
            g: color.g,
            b: color.b
        }
    })(index, lerp)

}
