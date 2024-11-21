

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
    MeshBasicMaterial,
    Camera,
    RepeatWrapping,
    MeshPhysicalMaterial,
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
    initLoader,
    imagePath,
} from '../lib/tools/index.js';
import {
    World, Sphere, Body, Material, ContactMaterial, Plane, NaiveBroadphase,
} from '../lib/other/physijs/cannon.js';
import { printTexture } from "../lib/util/catch.js";
import { Maze } from '../algorithms/Maze.js'


const loader = initLoader();
window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();

    const camera = initOrthographicCamera(new Vector3(-500, 500, 500));

    const scene = initScene();
    initAmbientLight(scene);
    addLight(scene);

    initAxesHelper(scene);

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
    const groundMaterial = new MeshPhysicalMaterial();
    const wallMaterial = new MeshPhysicalMaterial();
    const topMaterial = new MeshPhysicalMaterial();

    // loader.setPath(`../../${imagePath}/Stylized_Bricks/`);
    // loader.load(`basecolor.png`, (texture) => {
    //     texture.wrapS = RepeatWrapping; // 横向重复
    //     wallMaterial.map = texture;
    //     texture.repeat.set(1, 50);
    //     texture.needUpdate = true;
    //     printTexture(' ', texture, renderer);
    // });
    loader.load(`../../${imagePath}/others/uv_grid_opengl.jpg`, (texture) => {
        wallMaterial.map = texture;
        wallMaterial.needsUpdate = true;
        printTexture(' ', texture, renderer);
    });

    const mesh = new Mesh(geometry, [new MeshPhongMaterial({ color: 'green' }), new MeshPhongMaterial({ color: 'gray' }), wallMaterial]);
    mesh.receiveShadow = mesh.castShadow = true;

    const texture = new CanvasTexture(canvas);
    material.map = texture;

    console.log(maze);

    function createGeometry(data) {
        const geometry = new BufferGeometry();
        const position = [];
        const uvs = [];

        const indicesTop = [];
        const indicesBottom = [];
        const indicesSides = [];


        let [ax, ay, bx, by, cx, cy, dx, dy] = [0, 0, 0, 0, 0, 0, 0, 0];
        let [ia, ib, ic, id] = [0, 0, 0, 0];
        const [pa, pb, pc, pd] = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
        let total = 0;
        //   --->
        //  a-----b
        //  |   / |  |
        //  |  /  |  |/
        //  d-----c

        const topVertex = [];
        const bottomVertex = [];
        for (let row = 0, j = data.length; row < j; row++) {
            for (let col = 0, k = data[0].length; col < k; col++) {
                if (data[row][col] === 1) {
                    topVertex.push({ x: row, y: col });
                } else {
                    bottomVertex.push({ x: row, y: col });
                }
            }
        }

        topVertex.forEach(({ x, y }) => {
            addFace(x, y, 'top', total, indicesTop);
            total += 4;
        });

        bottomVertex.forEach(({ x, y }) => {
            addFace(x, y, 'bottom', total, indicesBottom);
            total += 4;
        });


        // 用于存储侧墙的位置
        const sideWalls = [];
        // 水平方向检查侧墙
        for (let i = 0, il = data.length; i < il; i++) {
            for (let j = 0, jl = data[i].length - 1; j < jl; j++) {
                if (data[i][j] === 0 && data[i][j + 1] === 1) {
                    sideWalls.push({ row: i, col: j, direction: 'left' });
                } else if (data[i][j] === 1 && data[i][j + 1] === 0) {
                    sideWalls.push({ row: i, col: j, direction: 'right' });
                }
            }
        }

        // 垂直方向检查侧墙
        for (let j = 0, jl = data[0].length; j < jl; j++) {
            for (let i = 0, il = data.length - 1; i < il; i++) {
                if (data[i][j] === 0 && data[i + 1][j] === 1) {
                    sideWalls.push({ row: i, col: j, direction: 'back' });
                } else if (data[i][j] === 1 && data[i + 1][j] === 0) {
                    sideWalls.push({ row: i, col: j, direction: 'front' });
                }
            }
        }

        sideWalls.forEach(({ row, col, direction }, i) => {
            addFace(row, col, direction, total, indicesSides);
            total += 4;
        })

        geometry.addGroup(0, indicesTop.length, 0);   // 顶部
        geometry.addGroup(indicesTop.length, indicesBottom.length, 1); // 底部
        geometry.addGroup(indicesTop.length + indicesBottom.length, indicesSides.length, 2);  // 侧墙

        geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
        geometry.setIndex([...indicesTop, ...indicesBottom, ...indicesSides]);
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();
        geometry.userData['materialOrder'] = ['top', 'bottom', 'side'];

        function addFace(x, y, direction, offset, indices) {
            [ax, ay, bx, by, cx, cy, dx, dy] = [x, y, x, y + 1, x + 1, y + 1, x + 1, y];

            switch (direction) {
                case 'top':
                    {
                        pa.set(dx * cellSize, height, dy * cellSize);
                        pb.set(cx * cellSize, height, cy * cellSize);
                        pc.set(bx * cellSize, height, by * cellSize);
                        pd.set(ax * cellSize, height, ay * cellSize);
                    }
                    break;
                case 'bottom':
                    {
                        pa.set(dx * cellSize, 0, dy * cellSize);
                        pb.set(cx * cellSize, 0, cy * cellSize);
                        pc.set(bx * cellSize, 0, by * cellSize);
                        pd.set(ax * cellSize, 0, ay * cellSize);
                    }
                    break;
                case 'back':
                    {
                        const [na, nb] = [ax + 1, bx + 1]
                        pa.set(na * cellSize, height, ay * cellSize);
                        pb.set(nb * cellSize, height, by * cellSize);
                        pc.set(nb * cellSize, 0, by * cellSize);
                        pd.set(na * cellSize, 0, ay * cellSize);
                    }
                    break;
                case 'front':
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

        return geometry;
    }

    return {
        mesh
    }

}

function addLight(scene) {
    const light = initDirectionLight();
    light.position.set(-50, 200, 25);
    light.shadow.camera.left = -200;
    light.shadow.camera.right = 200;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -180;
    light.shadow.camera.far = 270;
    light.shadow.mapSize.height = 4096;
    light.shadow.mapSize.width = 4096;
    scene.add(light);
}