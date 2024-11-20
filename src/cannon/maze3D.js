

import {
    Mesh,
    Clock,
    Vector2,
    Vector3,
    MeshPhongMaterial,
    Float32BufferAttribute,
    CanvasTexture,
    BufferGeometry,
    MeshNormalMaterial,
    PlaneGeometry,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initAmbientLight,
    initDirectionLight,
    HALF_PI,
    initAxesHelper,
    previewCanvas
} from '../lib/tools/index.js';
import {
    World, Sphere, Body, Material, ContactMaterial, Plane, NaiveBroadphase,
} from '../lib/other/physijs/cannon.js';
import { Maze } from '../algorithms/Maze.js'
import { printTexture } from '../lib/util/catch.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(-500, 500, 500));


    const scene = initScene();

    initAmbientLight(scene);

    const light = initDirectionLight();

    initAxesHelper(scene)

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const maze = createMaze();
    maze.mesh.position.set(-130, 0, -130);

    scene.add(maze.mesh);


    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}

function createMaze() {

    const material = new MeshPhongMaterial({ color: '#000000' });

    const cellSize = 5;
    const height = 10;

    const canvas = document.createElement('canvas');
    canvas.width = 265;
    canvas.height = 265;
    const ctx = canvas.getContext('2d');
    const maze = new Maze(51, 51, cellSize);
    maze.generate(1, 1);
    maze.grid.unshift(new Array(51).fill(0));
    maze.grid.push(new Array(51).fill(0));
    maze.grid.forEach((row) => {
        row.unshift(0);
        row.push(0);
    });
    maze.draw(ctx);
    const geometry = createGeometry(maze.grid, height);

    const mesh = new Mesh(geometry, new MeshNormalMaterial({ side: 0 }));
    mesh.receiveShadow = mesh.castShadow = true;

    const texture = new CanvasTexture(canvas);
    material.map = texture;

    printTexture('maze', texture, renderer)
    console.log(maze);

    function createGeometry(data) {
        const [j, k] = [data.length - 1, data[0].length - 1];
        console.log('j, k: ', j, k);
        const geometry = new BufferGeometry();
        const position = [];
        const indices = [];
        const uvs = [];


        let [ax, ay, bx, by, cx, cy, dx, dy] = [0, 0, 0, 0, 0, 0, 0, 0];
        let [x0, y0, x1, y1, x2, y2, x3, y3] = [0, 0, 0, 0, 0, 0, 0, 0];
        let [ia, ib, ic, id] = [0, 0, 0, 0];
        const [pa, pb, pc, pd] = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
        let [va, vb, vc, vd] = [0, 0, 0, 0];
        let total = 0;
        //   --->
        //  a-----b
        //  |   / |  |
        //  |  /  |  |/
        //  d-----c

        for (let row = 0; row < j; row = row + 2) {
            for (let col = 0; col < k; col = col + 2) {
                [x0, y0, x1, y1, x2, y2, x3, y3] = [row, col, row, col + 1, row + 1, col + 1, row + 1, col];
                [va, vb, vc, vd] = [data[x0][y0], data[x1][y1], data[x2][y2], data[x3][y3]];

                singleFace(x0, y0, va * height, total);
                total += 4;
                singleFace(x1, y1, vb * height, total);
                total += 4;
                singleFace(x2, y2, vc * height, total);
                total += 4;
                singleFace(x3, y3, vd * height, total);
                total += 4;
            }
        }

        // 用于存储侧墙的位置
        const sideWalls = [];
        // 水平方向检查侧墙
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length - 1; j++) {
                if (data[i][j] === 0 && data[i][j + 1] === 1) {
                    sideWalls.push({ row: i, col: j, direction: 'left' });
                } else if (data[i][j] === 1 && data[i][j + 1] === 0) {
                    sideWalls.push({ row: i, col: j, direction: 'right' });
                }
            }
        }

        // 垂直方向检查侧墙
        for (let j = 0; j < data[0].length; j++) {
            for (let i = 0; i < data.length - 1; i++) {
                if (data[i][j] === 0 && data[i + 1][j] === 1) {
                    sideWalls.push({ row: i, col: j, direction: 'bottom' });
                } else if (data[i][j] === 1 && data[i + 1][j] === 0) {
                    sideWalls.push({ row: i, col: j, direction: 'top' });
                }
            }
        }

        sideWalls.forEach(({ row, col, direction }, i) => {
            sideFace(row, col, direction, total);
            total = total + 4;
        })

        console.log(sideWalls);

        function singleFace(x, y, h, offset) {
            [ax, ay, bx, by, cx, cy, dx, dy] = [x, y, x, y + 1, x + 1, y + 1, x + 1, y];
            pa.set(ax * cellSize, h, ay * cellSize);
            pb.set(bx * cellSize, h, by * cellSize);
            pc.set(cx * cellSize, h, cy * cellSize);
            pd.set(dx * cellSize, h, dy * cellSize);
            position.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z, pd.x, pd.y, pd.z);

            [ia, ib, ic, id] = [offset, offset + 1, offset + 2, offset + 3];
            indices.push(ib, id, ia, id, ib, ic);

            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        }

        function sideFace(x, y, direction, offset) {
            [ax, ay, bx, by, cx, cy, dx, dy] = [x, y, x, y + 1, x + 1, y + 1, x + 1, y];

            switch (direction) {
                case 'bottom':
                    {
                        const [na, nb] = [ax + 1, bx + 1]
                        pa.set(na * cellSize, height, ay * cellSize);
                        pb.set(nb * cellSize, height, by * cellSize);
                        pc.set(nb * cellSize, 0, by * cellSize);
                        pd.set(na * cellSize, 0, ay * cellSize);
                    }
                    break;
                case 'top':
                    {
                        pa.set(cx * cellSize, height, cy * cellSize);
                        pb.set(dx * cellSize, height, dy * cellSize);
                        pc.set(dx * cellSize, 0, dy * cellSize);
                        pd.set(cx * cellSize, 0, cy * cellSize);
                    }
                    break;
                case 'left':
                    {
                        const [nd, na] = [dy + 1, ay + 1]
                        pa.set(dx * cellSize, height, nd * cellSize);
                        pb.set(ax * cellSize, height, na * cellSize);
                        pc.set(ax * cellSize, 0, na * cellSize);
                        pd.set(dx * cellSize, 0, nd * cellSize);
                    }
                    break;
                case 'right':
                    {
                        pa.set(bx * cellSize, height, by * cellSize);
                        pb.set(cx * cellSize, height, cy * cellSize);
                        pc.set(cx * cellSize, 0, cy * cellSize);
                        pd.set(bx * cellSize, 0, by * cellSize);
                    }
                    break;
            }

            position.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z, pd.x, pd.y, pd.z);
            [ia, ib, ic, id] = [offset, offset + 1, offset + 2, offset + 3];
            indices.push(ia, id, ib, ic, ib, id);

            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        }


        geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
        geometry.setIndex(indices);
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();
        return geometry;
    }



    return {
        mesh
    }

}