/*
 * @Date: 2024-01-10 20:15:32
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-10 21:02:10
 * @FilePath: /threejs-demo/src/particle/image.js
 */
import {
    BufferGeometry,
    PointsMaterial,
    Points,
    Vector3,
    Vector2,
    Float32BufferAttribute,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    resize,
    initScene,
    initOrbitControls,
    initOrthographicCamera,
    initGUI
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, 0, 20))
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = initScene();
    renderer.setClearColor(0xffffff);

    const controls = initOrbitControls(camera, renderer.domElement);
    resize(renderer, camera);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const geometry = new BufferGeometry();
    const material = new PointsMaterial({ vertexColors: true });
    const points = new Points(geometry, material);
    scene.add(points);

    const control = {
        unit: 1
    }

    const image = new Image();
    image.src = '../../public/images/others/girl.jpg';
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        console.log(image);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const bit = gcd(canvas.width, canvas.height);

        updateGeometry(imageData, bit);
    }

    function updateGeometry(imageData, bit) {
        const size = new Vector2()
        return (() => {
            const pointsNumber = bit * control.unit
            size.set(canvas.width / pointsNumber, canvas.height / pointsNumber);
            console.log(imageData, bit, size);
            const positionBuffer = new Float32BufferAttribute(size.x * size.y * 3);
            const colorBuffer = new Float32BufferAttribute(size.x * size.y * 3);
            for (let j = 0, k = positionBuffer.count / 3; j < k; j++) {
                const element = array[j];

            }

            const geometry = new BufferGeometry();
            points.geometry.dispose();
            points.geometry = geometry;
            geometry.setAttribute('position', positionBuffer);
        })()
    }





    function render() {
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();
    gui.add(control, 'unit', 1, 10).onChange(updateGeometry);
}

function gcd(a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

function lcm(a, b) {
    const gcdValue = gcd(a, b);
    return (a * b) / gcdValue;
}
