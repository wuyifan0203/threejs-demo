/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-22 17:44:50
 * @FilePath: /threejs-demo/src/particle/common.js
 */
import {
    PerspectiveCamera,
    Sprite,
    SpriteMaterial,
    BufferGeometry,
    PointsMaterial,
    Float32BufferAttribute,
    Color,
    Points,
} from 'three';
import {
    initRenderer,
    resize,
    initScene,
    initOrbitControls,
    initGUI,
    initStats,
    initViewHelper
} from '../lib/tools/index.js';


window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();

    const stats = initStats();
    renderer.autoClear = false;
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000000);
    camera.position.set(3, 3, 63);
    camera.lookAt(10, 0, 0);
    const scene = initScene();
    renderer.setClearColor(0xffffff);

    const controls = initOrbitControls(camera, renderer.domElement);

    draw(scene);
    const viewHelper = initViewHelper(camera, renderer.domElement);
    resize(renderer, camera);

    function render() {
        stats.begin();
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
        stats.end();
        requestAnimationFrame(render);
    }

    render();

}

function draw(scene) {
    const gui = initGUI();
    const controls = {
        row: 30,
        col: 20,
        drawFunc: createParticlesBySprite,
        color: '#ffffff',
    };
    createParticlesBySprite();
    gui.add(controls, 'row', 1, 500, 1).onChange(() => {
        change(scene);
    });
    gui.add(controls, 'col', 1, 500, 1).onChange(() => {
        change(scene);
    });
    gui.add(controls, 'drawFunc', {
        Sprite: createParticlesBySprite,
        Points: createParticlesByPoints,
    }).onChange(() => {
        change(scene);
    });

    function createParticlesBySprite() {
        const hx = controls.row / 2;
        const hy = controls.col / 2;
        for (let x = 0; x < controls.row; x++) {
            for (let y = 0; y < controls.col; y++) {
                const material = new SpriteMaterial({color: Math.random() * 0xffffff,});
                const sprite = new Sprite(material);
                sprite.position.set((x - hx) * 4, (y - hy) * 4, 0);
                scene.add(sprite);
            }
        }
    }

    function createParticlesByPoints() {
        const hx = controls.row / 2;
        const hy = controls.col / 2;
        const geom = new BufferGeometry();
        const material = new PointsMaterial({
            size: 3,
            vertexColors: true,
            color: 0xffffff,
        });
        const veticsFloat32Array = [];
        const veticsColors = [];
        for (let x = 0; x < controls.row; x++) {
            for (let y = 0; y < controls.col; y++) {
                veticsFloat32Array.push((x - hx) * 4, (y - hy) * 4, 0);
                const randomColor = new Color(Math.random() * 0xffffff);
                veticsColors.push(randomColor.r, randomColor.g, randomColor.b);
            }
        }
        const vertices = new Float32BufferAttribute(veticsFloat32Array, 3);
        const colors = new Float32BufferAttribute(veticsColors, 3);
        geom.attributes.position = vertices;
        geom.attributes.color = colors;
        const particles = new Points(geom, material);
        scene.add(particles);
    }

    function change(scene) {
        for (let i = 0; i < scene.children.length; i++) {
            const obj = scene.children[i];
            obj.parent = null;
            if (obj.material) {
                obj.material.dispose();
            }
            if (obj.geometry) {
                obj.geometry.dispose();
            }
        }
        scene.children.length = 0;

        // eslint-disable-next-line no-eval
        const F = eval(`(${controls.drawFunc})`);
        F(scene);
    }
}
