/*
 * @Date: 2024-01-10 20:15:32
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-23 10:40:19
 * @FilePath: /threejs-demo/src/particle/image.js
 */
import {
    BufferGeometry,
    PointsMaterial,
    Points,
    Vector3,
    Vector2,
    Float32BufferAttribute,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh
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
    const camera = initOrthographicCamera(new Vector3(0, 0, 2000))
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.01

    const scene = initScene();
    renderer.setClearColor(0x000000, 1);

    const controls = initOrbitControls(camera, renderer.domElement);
    resize(renderer, camera);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const geometry = new BufferGeometry();
    const material = new PointsMaterial({
        vertexColors: true,
        size: 1
    });
    const points = new Points(geometry, material);
    scene.add(points);

    controls.enableRotate = false;


    scene.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 'red' })))

    const image = new Image();
    image.src = '../../public/images/others/girl.jpg';
    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.scale(1, -1); // 垂直镜像翻转
        ctx.drawImage(image, 0, -canvas.height, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        updateGeometry(imageData.data);
    }

    function updateGeometry(imageData) {
        const size = new Vector2()
        size.set(canvas.width, canvas.height);

        const positionBuffer = [];
        const colorBuffer = [];
        for (let j = 0, jl = size.x, hj = jl / 2; j < jl; j++) {
            for (let k = 0, kl = size.y, hk = kl / 2; k < kl; k++) {
                positionBuffer.push(j - hj, k - hk, 0);
                const index = (j + k * jl) * 4;
                const r = imageData[index] / 255;
                const g = imageData[index + 1] / 255;
                const b = imageData[index + 2] / 255;
                colorBuffer.push(r, g, b); // 设置颜色

            }
        }

        const geometry = new BufferGeometry();
        points.geometry.dispose();
        points.geometry = geometry;
        geometry.setAttribute('position', new Float32BufferAttribute(positionBuffer, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colorBuffer, 3));

    }

    function render() {
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();


}

