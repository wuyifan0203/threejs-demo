/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-13 16:23:05
 * @FilePath: /threejs-demo/src/algorithms/quadTreeDemo.js
 */
import { Box2, BoxGeometry, Vector2, Vector3, Mesh } from '../lib/three/three.module.js';
import {
    initRenderer,
    resize,
    initScene,
    initOrbitControls,
    initStats,
    initOrthographicCamera,
} from '../lib/tools/index.js';
import { QuadTree } from './QuadTree.js';


window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();


    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, 0, 10));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    const scene = initScene();
    renderer.setClearColor(0xffffff);

    const stats = initStats();

    const controls = initOrbitControls(camera, renderer.domElement);

    resize(renderer, camera);



    const range = new Box2(new Vector2(-30, -30), new Vector2(30, 30));
    const quadTree = new QuadTree(range, 20);

    const position = [
        1, 1, 3, 0, 5, 0, 6, 6
    ]


    const meshes = []
    for (let j = 0; j < position / 2; j++) {
        const mesh = new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial({ color: 0x00ff00 }));
        meshes.push(mesh);
        scene.add(mesh);

        mesh.position.set(position[j * 2], position[j * 2 + 1], 0);

        !mesh.geometry.boundingBox && mesh.geometry.computeBoundingBox();

        const { min, max } = mesh.geometry.boundingBox
        const box = new Box2(new Vector2(min.x, min.y), new Vector2(max.x, max.y));

        console.log(box);

        quadTree.insertBox(box);

    }


    quadTree.insertBox();

    function render() {
        stats.begin();
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
        stats.end();
    }

    renderer.setAnimationLoop(render);
}
