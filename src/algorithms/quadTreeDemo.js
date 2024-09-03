/*
 * @Date: 2023-01-09 14:37:51
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-09-03 10:59:06
 * @FilePath: /threejs-demo/src/algorithms/quadTreeDemo.js
 */
import { Box2, BoxGeometry, Vector2, Vector3, Mesh, MeshBasicMaterial, Color } from '../lib/three/three.module.js';
import {
    initRenderer,
    resize,
    initScene,
    initOrbitControls,
    initStats,
    initOrthographicCamera,
    initGUI
} from '../lib/tools/index.js';
import { QuadTree } from './QuadTree.js';
import { QuadTreeHelper } from './QuadTreeHelper.js';



window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();


    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, 0, 100));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.2;
    camera.updateProjectionMatrix();
    const scene = initScene();
    renderer.setClearColor(0xffffff);

    const stats = initStats();

    const controls = initOrbitControls(camera, renderer.domElement);

    resize(renderer, camera);



    const range = new Box2(new Vector2(-30, -30), new Vector2(30, 30));
    const quadTree = new QuadTree(range, 20);


    const meshes = [];



    function render() {
        stats.begin();
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(render)
    }

    render();

    const helper = new QuadTreeHelper(quadTree);
    scene.add(helper);


    let i = 0;
    const operation = {
        num: 80,
        addMesh() {
            meshes.forEach((m) => {
                m.geometry.dispose();
                m.material.dispose();
                m.removeFromParent();
            })
            meshes.length = 0;
            quadTree.reset()

            for (let j = 0; j < this.num; j++) {
                const size = Math.random() * 1 + 2;
                const mesh = new Mesh(new BoxGeometry(size, size, size), new MeshBasicMaterial({ color: new Color().setHSL(Math.random(), 0.7, 0.5) }));
                meshes.push(mesh);
                scene.add(mesh);

                mesh.position.set(Math.random() * 60 - 30, Math.random() * 60 - 30, 0);

                !mesh.geometry.boundingBox && mesh.geometry.computeBoundingBox();

                const { min, max } = mesh.geometry.boundingBox
                const box = new Box2(new Vector2(min.x, min.y), new Vector2(max.x, max.y));
                const center = new Vector2(mesh.position.x, mesh.position.y);
                box.min.add(center);
                box.max.add(center);

                mesh.box = box;
                box.mesh = mesh;

                quadTree.insertBox(box);
            }
            helper.update();

        },
        log() {
            console.log(quadTree);
        },
        intersectsTest() {
            i = 0;
            for (let k = 0, l = meshes.length; k < l; k++) {
                const mesh = meshes[k];
                insetTest(quadTree, mesh.box)
            }

            console.log('四叉树比较次数: ', i);
            const n = meshes.length
            console.log('阶乘比较次数: ', (n * (n - 1)) / 2);
        }
    }

    function insetTest(node, box) {
        if (node.boundBox.containsBox(box)) {
            node.children.forEach((b) => {
                if (b !== box) {
                    i++
                    b.intersectsBox(box) && box.mesh.material.color.setHSL(0, 0, 0);
                }

            })
            if (node.divided) {
                if (node.lu.boundBox.intersectsBox(box) || node.lu.boundBox.containsBox(box)) {
                    i++
                    insetTest(node.lu, box)
                }
                if (node.ld.boundBox.intersectsBox(box) || node.ld.boundBox.containsBox(box)) {
                    i++
                    insetTest(node.ld, box)
                }
                if (node.ru.boundBox.intersectsBox(box) || node.ru.boundBox.containsBox(box)) {
                    i++
                    insetTest(node.ru, box)
                }
                if (node.rd.boundBox.intersectsBox(box) || node.rd.boundBox.containsBox(box)) {
                    i++
                    insetTest(node.rd, box)
                }
            }
        }


    }

    const gui = initGUI();
    gui.add(operation, 'num', 3, 3000, 1);
    gui.add(operation, 'addMesh');

    gui.add(operation, 'log');
    gui.add(operation, 'intersectsTest');

    operation.addMesh();
    operation.intersectsTest();
}
